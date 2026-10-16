"""
Geocode Jan Aushadhi Kendras from kendra.docx

This script:
1. Reads kendra.docx containing 1,760 Kendra records
2. Geocodes each address using Nominatim (OpenStreetMap)
3. Implements caching to avoid re-geocoding
4. Handles failures with progressive simplification
5. Outputs two CSV files: successful and failed geocoding

Usage:
    python geocode_kendras.py
"""

import csv
import json
import time
from pathlib import Path
from typing import Dict, List, Optional, Tuple
from docx import Document
import requests
from datetime import datetime

# Configuration
NOMINATIM_URL = "https://nominatim.openstreetmap.org/search"
USER_AGENT = "KendraGeocoding/1.0 (Smart Medicine System)"
RATE_LIMIT_DELAY = 1.1  # Nominatim requires 1 req/sec, using 1.1 for safety
CACHE_FILE = Path(__file__).parent / "geocoding_cache.json"
OUTPUT_SUCCESS = Path(__file__).parent / "kendra_geocoded.csv"
OUTPUT_FAILED = Path(__file__).parent / "kendra_geocoding_failed.csv"
KENDRA_DOCX = Path(__file__).parent.parent / "kendra.docx"

# CSV Headers
CSV_HEADERS = [
    "kendra_code",
    "owner_name",
    "state",
    "district",
    "pin_code",
    "address",
    "latitude",
    "longitude",
    "geocoding_status",
    "geocoding_query"
]

FAILED_HEADERS = CSV_HEADERS + ["failure_reason"]


class GeocodingCache:
    """Simple JSON-based cache for geocoding results"""
    
    def __init__(self, cache_file: Path):
        self.cache_file = cache_file
        self.cache = self._load_cache()
    
    def _load_cache(self) -> Dict:
        """Load cache from file"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'r', encoding='utf-8') as f:
                    return json.load(f)
            except Exception as e:
                print(f"Warning: Could not load cache: {e}")
                return {}
        return {}
    
    def _save_cache(self):
        """Save cache to file"""
        try:
            with open(self.cache_file, 'w', encoding='utf-8') as f:
                json.dump(self.cache, f, indent=2, ensure_ascii=False)
        except Exception as e:
            print(f"Warning: Could not save cache: {e}")
    
    def get(self, query: str) -> Optional[Dict]:
        """Get cached result for query"""
        return self.cache.get(query)
    
    def set(self, query: str, result: Dict):
        """Set cached result for query"""
        self.cache[query] = result
        self._save_cache()


class KendraGeocoder:
    """Geocode Kendra records using Nominatim"""
    
    def __init__(self):
        self.cache = GeocodingCache(CACHE_FILE)
        self.session = requests.Session()
        self.session.headers.update({'User-Agent': USER_AGENT})
        self.stats = {
            'total': 0,
            'success': 0,
            'cached': 0,
            'failed': 0,
            'api_calls': 0
        }
    
    def extract_kendras(self, docx_path: Path) -> List[Dict]:
        """Extract Kendra records from Word document"""
        print(f"Reading {docx_path.name}...")
        doc = Document(docx_path)
        texts = [p.text.strip() for p in doc.paragraphs]
        
        # 7 fields per record
        fields_per_record = 7
        total_records = len(texts) // fields_per_record
        
        print(f"✓ Found {total_records} Kendra records")
        
        kendras = []
        for i in range(total_records):
            start_idx = i * fields_per_record
            kendra = {
                'serial': texts[start_idx + 0],
                'kendra_code': texts[start_idx + 1],
                'owner_name': texts[start_idx + 2],
                'state': texts[start_idx + 3],
                'district': texts[start_idx + 4],
                'pin_code': texts[start_idx + 5],
                'address': texts[start_idx + 6]
            }
            kendras.append(kendra)
        
        return kendras
    
    def build_geocoding_queries(self, kendra: Dict) -> List[str]:
        """Build progressive geocoding queries (full to simplified)"""
        queries = []
        
        # Query 1: Full address
        queries.append(
            f"{kendra['address']}, {kendra['district']}, {kendra['state']}, {kendra['pin_code']}, India"
        )
        
        # Query 2: Without street address
        queries.append(
            f"{kendra['district']}, {kendra['state']}, {kendra['pin_code']}, India"
        )
        
        # Query 3: District center
        queries.append(
            f"{kendra['district']}, {kendra['state']}, India"
        )
        
        return queries
    
    def geocode_query(self, query: str) -> Optional[Tuple[float, float]]:
        """Geocode a single query using Nominatim"""
        # Check cache first
        cached = self.cache.get(query)
        if cached is not None:
            self.stats['cached'] += 1
            if cached.get('success'):
                return (cached['latitude'], cached['longitude'])
            return None
        
        # Make API call
        try:
            params = {
                'q': query,
                'format': 'json',
                'limit': 1,
                'addressdetails': 1
            }
            
            self.stats['api_calls'] += 1
            response = self.session.get(NOMINATIM_URL, params=params, timeout=10)
            response.raise_for_status()
            
            results = response.json()
            
            if results and len(results) > 0:
                lat = float(results[0]['lat'])
                lon = float(results[0]['lon'])
                
                # Cache success
                self.cache.set(query, {
                    'success': True,
                    'latitude': lat,
                    'longitude': lon,
                    'timestamp': datetime.now().isoformat()
                })
                
                return (lat, lon)
            else:
                # Cache failure
                self.cache.set(query, {
                    'success': False,
                    'timestamp': datetime.now().isoformat()
                })
                return None
        
        except Exception as e:
            print(f"  ⚠ API error: {e}")
            # Don't cache errors, allow retry
            return None
    
    def geocode_kendra(self, kendra: Dict) -> Dict:
        """Geocode a single Kendra with progressive fallback"""
        queries = self.build_geocoding_queries(kendra)
        
        for query_idx, query in enumerate(queries):
            result = self.geocode_query(query)
            
            if result:
                lat, lon = result
                return {
                    'kendra_code': kendra['kendra_code'],
                    'owner_name': kendra['owner_name'],
                    'state': kendra['state'],
                    'district': kendra['district'],
                    'pin_code': kendra['pin_code'],
                    'address': kendra['address'],
                    'latitude': lat,
                    'longitude': lon,
                    'geocoding_status': f'success_query_{query_idx + 1}',
                    'geocoding_query': query
                }
            
            # Rate limit between attempts
            if query_idx < len(queries) - 1:
                time.sleep(0.5)
        
        # All queries failed
        return {
            'kendra_code': kendra['kendra_code'],
            'owner_name': kendra['owner_name'],
            'state': kendra['state'],
            'district': kendra['district'],
            'pin_code': kendra['pin_code'],
            'address': kendra['address'],
            'latitude': '',
            'longitude': '',
            'geocoding_status': 'failed',
            'geocoding_query': queries[0],
            'failure_reason': 'No results found for any query variation'
        }
    
    def process_all_kendras(self):
        """Main processing function"""
        print("=" * 80)
        print("KENDRA GEOCODING PROCESS")
        print("=" * 80)
        
        # Extract Kendras
        kendras = self.extract_kendras(KENDRA_DOCX)
        self.stats['total'] = len(kendras)
        
        print(f"\nProvider: Nominatim (OpenStreetMap)")
        print(f"Rate Limit: 1 request/second")
        print(f"Estimated Time: ~{len(kendras) // 60} minutes")
        print(f"Cache File: {CACHE_FILE.name}")
        
        # Open output files
        success_file = open(OUTPUT_SUCCESS, 'w', newline='', encoding='utf-8')
        failed_file = open(OUTPUT_FAILED, 'w', newline='', encoding='utf-8')
        
        success_writer = csv.DictWriter(success_file, fieldnames=CSV_HEADERS)
        failed_writer = csv.DictWriter(failed_file, fieldnames=FAILED_HEADERS)
        
        success_writer.writeheader()
        failed_writer.writeheader()
        
        print("\n" + "=" * 80)
        print("GEOCODING IN PROGRESS")
        print("=" * 80)
        print()
        
        try:
            start_time = time.time()
            
            for idx, kendra in enumerate(kendras, 1):
                print(f"[{idx}/{len(kendras)}] {kendra['kendra_code']}: {kendra['district']}, {kendra['state']}", end=' ... ')
                
                result = self.geocode_kendra(kendra)
                
                if result['geocoding_status'].startswith('success'):
                    success_writer.writerow({k: result[k] for k in CSV_HEADERS})
                    self.stats['success'] += 1
                    print(f"✓ ({result['latitude']:.4f}, {result['longitude']:.4f})")
                else:
                    failed_writer.writerow(result)
                    self.stats['failed'] += 1
                    print("✗ FAILED")
                
                # Progress update every 50 records
                if idx % 50 == 0:
                    elapsed = time.time() - start_time
                    rate = idx / elapsed
                    remaining = (len(kendras) - idx) / rate
                    print(f"  Progress: {idx}/{len(kendras)} | Success: {self.stats['success']} | Failed: {self.stats['failed']} | ETA: {remaining/60:.1f} min")
                
                # Rate limiting (except on last record)
                if idx < len(kendras):
                    time.sleep(RATE_LIMIT_DELAY)
        
        finally:
            success_file.close()
            failed_file.close()
        
        # Final summary
        elapsed_time = time.time() - start_time
        
        print("\n" + "=" * 80)
        print("GEOCODING COMPLETE")
        print("=" * 80)
        print(f"\nTotal Records:     {self.stats['total']}")
        print(f"Successfully Geocoded: {self.stats['success']} ({self.stats['success']/self.stats['total']*100:.1f}%)")
        print(f"Failed:            {self.stats['failed']} ({self.stats['failed']/self.stats['total']*100:.1f}%)")
        print(f"From Cache:        {self.stats['cached']}")
        print(f"API Calls Made:    {self.stats['api_calls']}")
        print(f"Elapsed Time:      {elapsed_time/60:.1f} minutes")
        
        print(f"\n✓ Success File: {OUTPUT_SUCCESS}")
        print(f"✓ Failed File:  {OUTPUT_FAILED}")
        print(f"✓ Cache File:   {CACHE_FILE}")
        
        print("\n" + "=" * 80)


def main():
    """Main entry point"""
    geocoder = KendraGeocoder()
    geocoder.process_all_kendras()


if __name__ == "__main__":
    main()

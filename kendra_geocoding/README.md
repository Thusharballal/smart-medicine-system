# Kendra Geocoding

This directory contains the geocoding infrastructure for Jan Aushadhi Kendra records extracted from the official PMBI `kendra.docx` file.

## Overview

**Source**: `kendra.docx` (1,760 official PMBI Jan Aushadhi Kendra records)  
**Purpose**: Convert Kendra addresses to latitude/longitude coordinates  
**Provider**: Nominatim (OpenStreetMap) - FREE geocoding service  
**Method**: Progressive simplification with caching  

## Files

- **`geocode_kendras.py`** - Main geocoding script
- **`kendra_geocoded.csv`** - Successfully geocoded Kendras (output)
- **`kendra_geocoding_failed.csv`** - Failed geocoding attempts (output)
- **`geocoding_cache.json`** - Cache to avoid re-geocoding (generated)
- **`README.md`** - This file

## Usage

### Run Geocoding

```bash
python geocode_kendras.py
```

The script will:
1. Read all 1,760 Kendra records from `kendra.docx`
2. Geocode each address using Nominatim
3. Respect rate limits (1 request/second)
4. Cache all results
5. Output two CSV files

**Estimated Time**: ~30-35 minutes

### Re-run (with cache)

If the script is interrupted or you need to re-run:
- The cache (`geocoding_cache.json`) will be used
- Only new/failed addresses will be geocoded
- Much faster on subsequent runs

### Clear Cache

To force re-geocoding from scratch:
```bash
rm geocoding_cache.json
```

## Geocoding Strategy

### Query Construction

For each Kendra, three progressive queries are attempted:

1. **Full Address**: `{Address}, {District}, {State}, {PIN Code}, India`
2. **No Street Address**: `{District}, {State}, {PIN Code}, India`
3. **District Center**: `{District}, {State}, India`

The first successful query is used.

### Example Queries

```
Query 1: General Hospital Compound, Chikkaballapura, Karnataka, 561207, India
Query 2: Chikkaballapura, Karnataka, 561207, India
Query 3: Chikkaballapura, Karnataka, India
```

### Failure Handling

If all three queries fail:
- Record is marked as `failed`
- Saved to `kendra_geocoding_failed.csv`
- No coordinates are invented
- Can be manually corrected later

## Output Format

### kendra_geocoded.csv

```csv
kendra_code,owner_name,state,district,pin_code,address,latitude,longitude,geocoding_status,geocoding_query
PMBJK00884,Dr.Gyna Kumar C,Karnataka,Chikkaballapura,561207,General Hospital Compound,13.4355,77.7315,success_query_1,"General Hospital Compound, Chikkaballapura, Karnataka, 561207, India"
```

**Columns**:
- `kendra_code` - Unique Kendra identifier
- `owner_name` - Kendra owner/operator
- `state` - State name
- `district` - District name
- `pin_code` - 6-digit postal code
- `address` - Full street address
- `latitude` - Decimal latitude (WGS84)
- `longitude` - Decimal longitude (WGS84)
- `geocoding_status` - Success level (success_query_1/2/3)
- `geocoding_query` - Query that returned results

### kendra_geocoding_failed.csv

Same columns as above, plus:
- `failure_reason` - Why geocoding failed

## Rate Limits & Terms

### Nominatim Usage Policy

- **Rate Limit**: 1 request per second (strictly enforced)
- **User-Agent**: Required in all requests
- **Terms**: https://operations.osmfoundation.org/policies/nominatim/
- **Fair Use**: This script respects all terms

### Compliance

✅ Using official PMBI data (public information)  
✅ Geocoding public addresses only  
✅ Respecting rate limits (1.1s delay between requests)  
✅ Proper User-Agent header  
✅ Caching to minimize requests  
✅ No abuse or excessive usage  

## Expected Results

- **Total Records**: 1,760
- **Expected Success**: ~85-90% (1,500-1,600 records)
- **Expected Failures**: ~10-15% (160-260 records)

Failures typically occur for:
- Very rural/remote locations
- Incomplete addresses
- New constructions not in OSM database
- Addresses with typos

## Next Steps After Geocoding

Once geocoding is complete:

1. **Review Failed Records** - Check `kendra_geocoding_failed.csv`
2. **Manual Corrections** - Optionally correct failed addresses
3. **Import to MongoDB** - Load `kendra_geocoded.csv` into your database
4. **Display on Map** - Use coordinates in your mapping component

## Importing to MongoDB

Example script to import geocoded data:

```python
import pandas as pd
from pymongo import MongoClient

# Read CSV
df = pd.read_csv('kendra_geocoded.csv')

# Connect to MongoDB
client = MongoClient('mongodb://localhost:27017/')
db = client['smart_medicine']
collection = db['jan_aushadhi_kendras']

# Convert to records
records = df.to_dict('records')

# Insert
collection.insert_many(records)
print(f"✓ Imported {len(records)} Kendras")
```

## Troubleshooting

### Script Stops/Errors

- Check internet connection
- Verify kendra.docx exists in parent directory
- Check cache file isn't corrupted
- Review error messages

### Low Success Rate (<80%)

- Check if Nominatim is accessible
- Verify rate limiting is working
- Review failed records for patterns

### Cache Issues

Delete `geocoding_cache.json` and re-run.

## Support

For geocoding issues:
- Check Nominatim status: https://nominatim.openstreetmap.org/
- Review OSM India coverage: https://openstreetmap.org/

For data issues:
- Verify kendra.docx is the official PMBI document
- Check record count (should be 1,760)

## Privacy & Ethics

This geocoding process:
- Uses only publicly available PMBI Kendra information
- Converts public addresses to coordinates
- Does not collect or transmit sensitive data
- Respects open-source geocoding terms
- Implements proper rate limiting
- Uses caching to minimize server load

---

**Version**: 1.0  
**Date**: January 2025  
**Provider**: Nominatim (OpenStreetMap)  
**Source**: PMBI kendra.docx (Official)

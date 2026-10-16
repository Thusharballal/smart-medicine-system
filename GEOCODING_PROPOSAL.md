# Kendra Geocoding Proposal

## Data Source Analysis

**File**: `kendra.docx`  
**Total Records**: **1,760 Jan Aushadhi Kendras**  
**Data Structure**: 7 fields per record (paragraphs, not tables)

### Field Structure
1. **Serial Number**: Sequential counter (1-1760)
2. **Kendra Code**: Unique identifier (e.g., PMBJK00884)
3. **Owner Name**: Kendra owner/operator name
4. **State**: State name (e.g., Karnataka)
5. **District**: District name (e.g., Chikkaballapura)
6. **PIN Code**: 6-digit postal code
7. **Address**: Full street address

### Sample Records
```
Record 1:
  Kendra Code: PMBJK00884
  Owner: Dr.Gyna Kumar C
  State: Karnataka
  District: Chikkaballapura
  PIN Code: 561207
  Address: General Hospital Compound

Record 2:
  Kendra Code: PMBJK00886
  Owner: Mr. Ramesh Gireppa Kanti
  State: Karnataka
  District: Bagalkote
  PIN Code: 587301
  Address: Cmc No1505 Ground Floor Shop No 8 Partnalli Complex Wno 15 Near Post Office Theater Road
```

---

## Geocoding Strategy

### Geocoding Query Format
For each Kendra, we will construct a full address query:
```
{Address}, {District}, {State}, {PIN Code}, India
```

Example geocoding queries:
1. `General Hospital Compound, Chikkaballapura, Karnataka, 561207, India`
2. `Cmc No1505 Ground Floor Shop No 8 Partnalli Complex Wno 15 Near Post Office Theater Road, Bagalkote, Karnataka, 587301, India`

### Progressive Simplification Strategy
If geocoding fails with the full address, we will progressively simplify:
1. **Full**: `{Address}, {District}, {State}, {PIN Code}, India`
2. **Without Address**: `{District}, {State}, {PIN Code}, India`
3. **District Center**: `{District}, {State}, India`

This ensures we get the best possible coordinates while handling incomplete/unclear addresses.

---

## Recommended Geocoding Provider

### Option 1: **Nominatim (OpenStreetMap)** ⭐ RECOMMENDED
- **Cost**: FREE
- **API Key**: NOT required
- **Rate Limit**: 1 request/second (strict)
- **Accuracy**: Good for Indian addresses
- **Estimated Time**: ~30-35 minutes for 1,760 requests (with 1 req/sec rate limit)
- **Usage Policy**: Must include User-Agent header, respect rate limits
- **Terms**: https://operations.osmfoundation.org/policies/nominatim/

**Endpoint**: `https://nominatim.openstreetmap.org/search`

**Pros**:
- No API key required
- No cost
- Good coverage of India
- No daily limits

**Cons**:
- Strict 1 req/sec rate limit (takes ~30 min)
- Less accurate for rural/complex addresses

---

### Option 2: **Google Geocoding API**
- **Cost**: $5 per 1000 requests = **$8.80 for 1,760 requests**
- **API Key**: REQUIRED (Google Cloud account)
- **Rate Limit**: 50 requests/second (very fast)
- **Accuracy**: Excellent for Indian addresses
- **Estimated Time**: ~1-2 minutes for 1,760 requests
- **Free Tier**: $200 monthly credit (covers ~40,000 requests)

**Endpoint**: `https://maps.googleapis.com/maps/api/geocode/json`

**Pros**:
- Highest accuracy
- Very fast
- Excellent handling of Indian addresses
- Free tier available

**Cons**:
- Requires Google Cloud account and API key
- Paid service (but free tier covers this task)

---

### Option 3: **Geoapify**
- **Cost**: FREE tier: 3,000 requests/day
- **API Key**: REQUIRED (free registration)
- **Rate Limit**: 5 requests/second (free tier)
- **Accuracy**: Good
- **Estimated Time**: ~6-7 minutes for 1,760 requests

**Endpoint**: `https://api.geoapify.com/v1/geocode/search`

**Pros**:
- Free tier sufficient for this task
- Faster than Nominatim
- No credit card required

**Cons**:
- Requires registration
- Accuracy may vary for rural areas

---

## Recommendation: **Nominatim (OpenStreetMap)**

For this task, I recommend **Nominatim** because:
1. ✅ No API key required - works immediately
2. ✅ No cost
3. ✅ No registration needed
4. ✅ Good coverage of Indian locations
5. ✅ Ethical and open-source
6. ⏱️ Time: ~30 minutes (acceptable for one-time task)

**Note**: Nominatim is NOT the same as "using OpenStreetMap to discover Kendras". We are using the official PMBI kendra.docx as the authoritative source. Nominatim is ONLY being used to convert existing addresses into latitude/longitude coordinates.

---

## Caching & Failure Handling

### Caching Strategy
- **File**: `geocoding_cache.json`
- **Cache Key**: Full geocoding query string
- **Purpose**: Avoid re-geocoding the same address if script is re-run

### Failure Handling
1. Attempt full address geocoding
2. If failed, try simplified address
3. If still failed, mark as `geocoding_failed` with reason
4. Save failed records to `kendra_geocoding_failed.csv` for manual review
5. DO NOT invent coordinates for failed records

### Expected Success Rate
- **Estimated**: 85-95% success rate
- **Failed records**: Will be saved separately for manual correction

---

## Output Files

### Directory Structure
```
kendra_geocoding/
├── geocode_kendras.py              # Main geocoding script
├── kendra_geocoded.csv             # Successfully geocoded records
├── kendra_geocoding_failed.csv     # Failed records for manual review
├── geocoding_cache.json            # Cache to avoid re-geocoding
└── README.md                       # Documentation
```

### CSV Columns (kendra_geocoded.csv)
```
kendra_code         | PMBJK00884
owner_name          | Dr.Gyna Kumar C
state               | Karnataka
district            | Chikkaballapura
pin_code            | 561207
address             | General Hospital Compound
latitude            | 13.4355
longitude           | 77.7315
geocoding_status    | success
geocoding_query     | General Hospital Compound, Chikkaballapura, Karnataka, 561207, India
```

### Failed CSV Columns (kendra_geocoding_failed.csv)
Same columns plus:
```
failure_reason      | No results found for any query variation
```

---

## Estimated Execution

- **Total Records**: 1,760
- **Provider**: Nominatim (1 req/sec)
- **Estimated Time**: ~30-35 minutes
- **Expected Success**: ~1,500-1,600 records (~85-90%)
- **Expected Failures**: ~160-260 records (~10-15%)

---

## Privacy & Compliance

✅ Using official PMBI data (public information)  
✅ Geocoding addresses only (no sensitive data)  
✅ Respecting rate limits and terms of service  
✅ Open-source geocoding provider (Nominatim)  
✅ No data being sent to third parties beyond geocoding  

---

## Next Steps

1. ✅ Data source analyzed (1,760 records confirmed)
2. ✅ Field structure identified
3. ✅ Geocoding provider recommended (Nominatim)
4. ✅ Output structure defined
5. ⏸️ **WAITING FOR YOUR APPROVAL**

**To proceed, please confirm:**
- Approve Nominatim as geocoding provider (or choose Google/Geoapify)
- Approve ~30 minute execution time
- Type: **"PROCEED WITH GEOCODING"**

Once approved, I will:
1. Create the `kendra_geocoding/` directory
2. Create `geocode_kendras.py` script
3. Execute the geocoding process
4. Generate the CSV files
5. Provide summary statistics

---

## Alternative: If You Want Faster Execution

If 30 minutes is too long, you can:
- **Option A**: Provide a Google Geocoding API key (execution time: ~2 minutes)
- **Option B**: Provide a Geoapify API key (execution time: ~7 minutes)

Otherwise, we proceed with Nominatim (free, no setup, 30 minutes).

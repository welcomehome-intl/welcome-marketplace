# Supabase Migrations

## How to Apply Migrations

### Option 1: Using Supabase CLI (Recommended)
```bash
# Install Supabase CLI if not installed
npm install -g supabase

# Link to your project
supabase link --project-ref jplicanfiibpkfqttgmi

# Apply migration
supabase db push
```

### Option 2: Using Supabase Dashboard (Manual)
1. Go to https://supabase.com/dashboard/project/jplicanfiibpkfqttgmi/sql/new
2. Copy the contents of `202501 26_extend_properties_table.sql`
3. Paste into the SQL Editor
4. Click "Run"

### Option 3: Using MCP Tool (From Claude Code)
The migration can be applied using the Supabase MCP tool:
```typescript
mcp__supabase__execute_sql({
  project_id: "jplicanfiibpkfqttgmi",
  query: "-- paste migration SQL here --"
})
```

---

## Migration Details

### 20250126_extend_properties_table.sql
**Purpose:** Add rich property metadata fields to support enhanced property listings

**Changes:**
- Adds `property_type` column (residential, commercial, land, industrial, mixed_use)
- Adds `size_value` and `size_unit` for property dimensions
- Adds `status` column (available, sold_out, coming_soon)
- Adds `amenities` array for features list
- Adds `featured_image_index` to mark primary image
- Creates indexes for common queries

**Safe to run:** Yes, uses `IF NOT EXISTS` and doesn't drop any data

---

## Post-Migration Checklist

- [ ] Run migration
- [ ] Verify new columns exist: `SELECT * FROM properties LIMIT 1;`
- [ ] Test image upload to `property-images` bucket
- [ ] Update existing properties with default values if needed
- [ ] Restart Next.js dev server to pick up type changes

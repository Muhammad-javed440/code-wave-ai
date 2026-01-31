---
name: supabase-rls
description: Generate and manage Supabase Row Level Security policies, database schemas, storage bucket policies, triggers, and functions for the Code Wave AI platform. Use when (1) Adding or modifying RLS policies on any table, (2) Creating new database tables that need security policies, (3) Setting up Supabase storage bucket policies for avatars or project media, (4) Writing admin-gated or user-gated SQL policies, (5) Reviewing or auditing existing RLS rules, (6) Adding contact_messages or any new table with proper security, (7) Any request mentioning "RLS", "row level security", "supabase policies", "storage policies", or "database security".
---

# Supabase RLS - Code Wave AI

## Core Rules

1. **RLS must be enabled** on every table — no exceptions.
2. **Admin role is enforced at DB level**, never frontend-only.
3. **Admin emails are hardcoded** in `handle_new_user()`: `meherjaved440@gmail.com`, `javedstore1013@gmail.com`, `codewaveai44@gmail.com`. Never change this list unless explicitly told.
4. **Two roles only**: `ADMIN` and `USER` (enum `user_role`).
5. All policies use `SECURITY DEFINER` functions with `SET search_path = public`.

## Admin Check Pattern

Every admin-gated policy uses:
```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
```

## Policy Templates

### Public read, admin write (projects, skills, team_members)
```sql
CREATE POLICY "{table}_read" ON {table} FOR SELECT USING (true);
CREATE POLICY "{table}_admin_write" ON {table}
FOR ALL USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

### Owner write (project_ratings, project_likes)
```sql
CREATE POLICY "{table}_read" ON {table} FOR SELECT USING (true);
CREATE POLICY "{table}_write" ON {table}
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "{table}_delete" ON {table}
FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

### Owner insert + admin/owner delete (project_comments)
```sql
CREATE POLICY "comments_read" ON project_comments FOR SELECT USING (true);
CREATE POLICY "comments_insert" ON project_comments
FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "comments_delete" ON project_comments
FOR DELETE USING (
  auth.uid() = user_id
  OR EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

### Anonymous insert, admin read (site_visits)
```sql
CREATE POLICY "visits_insert" ON site_visits
FOR INSERT WITH CHECK (length(path) < 500);
CREATE POLICY "visits_admin_read" ON site_visits
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

### Anonymous insert, admin manage (contact_messages)
```sql
CREATE POLICY "contact_insert" ON contact_messages
FOR INSERT WITH CHECK (length(message) < 5000);
CREATE POLICY "contact_admin_read" ON contact_messages
FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "contact_admin_update" ON contact_messages
FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
CREATE POLICY "contact_admin_delete" ON contact_messages
FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
);
```

## Adding a New Table Checklist

1. Create table with appropriate columns and constraints
2. `ALTER TABLE {table} ENABLE ROW LEVEL SECURITY;`
3. Add RLS policies using the appropriate template above
4. Add `updated_at` trigger if table has that column
5. Update `sql_query.txt` with the new SQL

## References

- **Full schema, RLS matrix, triggers, functions**: See [references/schema.md](references/schema.md)
- **Storage bucket policies (avatars, project-media)**: See [references/storage-policies.md](references/storage-policies.md)

# Code Wave AI - Database Schema & RLS Reference

## Enums

```sql
CREATE TYPE user_role AS ENUM ('ADMIN', 'USER');
```

## Admin Emails (Hardcoded)

- `meherjaved440@gmail.com`
- `javedstore1013@gmail.com`
- `codewaveai44@gmail.com`

## Tables

### profiles
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, references auth.users ON DELETE CASCADE |
| email | TEXT | UNIQUE NOT NULL |
| full_name | TEXT | NOT NULL |
| phone_number | TEXT | |
| role | user_role | DEFAULT 'USER' |
| avatar_url | TEXT | |
| bio | TEXT | |
| social_links | JSONB | DEFAULT '{}' |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### projects
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| title | TEXT | NOT NULL |
| description | TEXT | |
| media | TEXT[] | DEFAULT '{}' |
| video_url | TEXT | |
| price | NUMERIC(10,2) | |
| rating | NUMERIC(3,2) | DEFAULT 0 |
| likes_count | INTEGER | DEFAULT 0 |
| views_count | INTEGER | DEFAULT 0 |
| is_featured | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### project_ratings
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| project_id | UUID | FK → projects ON DELETE CASCADE |
| user_id | UUID | FK → profiles ON DELETE CASCADE |
| rating | INTEGER | CHECK (1-5) |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| | | UNIQUE (project_id, user_id) |

### project_likes
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| project_id | UUID | FK → projects ON DELETE CASCADE |
| user_id | UUID | FK → profiles ON DELETE CASCADE |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| | | UNIQUE (project_id, user_id) |

### project_comments
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| project_id | UUID | FK → projects ON DELETE CASCADE |
| user_id | UUID | FK → profiles ON DELETE CASCADE |
| user_name | TEXT | NOT NULL |
| content | TEXT | NOT NULL |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### site_visits
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| path | TEXT | DEFAULT '/' |
| user_agent | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

### skills
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| name | TEXT | NOT NULL |
| category | TEXT | NOT NULL |
| proficiency | INTEGER | CHECK (0-100) |
| icon | TEXT | |
| description | TEXT | |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### team_members
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| name | TEXT | NOT NULL |
| role | TEXT | NOT NULL |
| description | TEXT | |
| image_url | TEXT | |
| email | TEXT | |
| social_links | JSONB | DEFAULT '{}' |
| display_order | INTEGER | DEFAULT 0 |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |
| updated_at | TIMESTAMPTZ | DEFAULT NOW() |

### contact_messages
| Column | Type | Constraints |
|--------|------|-------------|
| id | UUID | PK, gen_random_uuid() |
| name | TEXT | NOT NULL |
| email | TEXT | NOT NULL |
| subject | TEXT | |
| message | TEXT | NOT NULL |
| is_read | BOOLEAN | DEFAULT false |
| created_at | TIMESTAMPTZ | DEFAULT NOW() |

## RLS Policy Matrix

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| profiles | Public | Own (uid=id) | Own (uid=id) | — |
| projects | Public | Admin only | Admin only | Admin only |
| project_ratings | Public | Own (uid=user_id) | Own | Admin |
| project_likes | Public | Own (uid=user_id) | — | Own + Admin |
| project_comments | Public | Own (uid=user_id) | — | Own + Admin |
| site_visits | Admin only | Anyone (path<500) | — | — |
| skills | Public | Admin only | Admin only | Admin only |
| team_members | Public | Admin only | Admin only | Admin only |
| contact_messages | Admin only | Anyone (anon) | Admin only | Admin only |

## Admin Check Pattern

All admin-gated policies use this subquery:
```sql
EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND role = 'ADMIN')
```

## Storage Buckets

### avatars
- Public read, authenticated users upload own avatar
- Path pattern: `{user_id}/filename`

### project-media
- Public read, admin-only upload/delete
- Path pattern: `{project_id}/filename`

## Triggers

| Trigger | Table | Event | Function |
|---------|-------|-------|----------|
| profiles_updated_at | profiles | BEFORE UPDATE | update_updated_at() |
| projects_updated_at | projects | BEFORE UPDATE | update_updated_at() |
| skills_updated_at | skills | BEFORE UPDATE | update_updated_at() |
| team_updated_at | team_members | BEFORE UPDATE | update_updated_at() |
| on_like_change | project_likes | AFTER INSERT/DELETE | update_project_likes_count() |
| on_rating_change | project_ratings | AFTER INSERT/UPDATE/DELETE | update_project_rating() |
| on_auth_user_created | auth.users | AFTER INSERT | handle_new_user() |

## Functions

- `update_updated_at()` — Sets `updated_at = NOW()` on row update
- `update_project_likes_count()` — Increments/decrements `projects.likes_count`
- `update_project_rating()` — Recalculates `projects.rating` as AVG
- `handle_new_user()` — Creates profile on signup, assigns ADMIN role to hardcoded emails

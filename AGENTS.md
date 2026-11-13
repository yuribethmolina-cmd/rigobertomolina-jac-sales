# Project architecture
- Vehicle detail pages use the shared vehicle registry and stable variant-specific IDs; catalog entries reference these IDs so different truck configurations never share commercial rows.
- Vehicles without verified media render an explicit missing-photo state instead of borrowing another variant's photo.
- The CRM panel reads the existing contact inboxes instead of copying them into a parallel table, so a contact never exists in two places; its private notes are append-only history.
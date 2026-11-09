# Orbit Digital CMS — Security Specification & Security TDD Suite

## 1. Data Invariants

1. **Administrator Exclusivity**: Only verified authenticated accounts matching the explicit administrator allowlist (`/adminAllowlist/{adminId}`) have read/write access to CMS drafts, revisions, site settings, raw media records, and audit logs.
2. **Public Isolation**: Unauthenticated public visitors have read-only access strictly to `/publishedContent/{contentId}` where publication state is finalized. No anonymous write, update, or delete is permitted anywhere.
3. **Draft Separation**: Draft sections (`/sections/{sectionId}`) and pages (`/pages/{pageId}`) cannot be read by public visitors, preventing data leaks of unreviewed content.
4. **Audit Immutability**: Audit logs (`/auditLogs/{logId}`) can only be appended by an authenticated authorized administrator; once created, audit logs can never be modified or deleted.
5. **No Universal Passwords or Client-Side Trust**: Role determination never relies on client tokens, localStorage flags, or custom claims. Authorization is strictly verified server-side and in security rules via direct document lookup.
6. **Volumetric Boundaries**: Document IDs, string lengths, and payload keys are strictly bounded to prevent resource exhaustion attacks.

---

## 2. The "Dirty Dozen" Adversarial Payloads

Below are 12 malicious payloads designed to test and prove the mathematical impossibility of unauthorized access or integrity bypass:

1. **Payload 1 (Anonymous Draft Write)**:
   - Target: `POST /sections/hero-01`
   - Request: Anonymous / No auth token
   - Expected Result: `PERMISSION_DENIED`
2. **Payload 2 (Unverified Email Admin Spoof)**:
   - Target: `POST /sections/hero-01`
   - Request: Token with `email: "info.safatravels.ksa@gmail.com"` but `email_verified: false`
   - Expected Result: `PERMISSION_DENIED`
3. **Payload 3 (Arbitrary Authenticated User Privilege Escalation)**:
   - Target: `POST /adminAllowlist/attacker-uid`
   - Request: Authenticated user attempting to add themselves to the allowlist
   - Expected Result: `PERMISSION_DENIED`
4. **Payload 4 (Audit Log Tampering / Deletion)**:
   - Target: `DELETE /auditLogs/log-entry-01`
   - Request: Any user (including admin) attempting to delete historical audit trails
   - Expected Result: `PERMISSION_DENIED`
5. **Payload 5 (Public Visitor Querying Drafts)**:
   - Target: `GET /sections` (querying draft records)
   - Request: Anonymous visitor
   - Expected Result: `PERMISSION_DENIED`
6. **Payload 6 (Shadow Key Injection in Section Update)**:
   - Target: `UPDATE /sections/hero-01`
   - Payload includes unauthorized system fields: `{ isSystemRoot: true, bypassRules: true }`
   - Expected Result: `PERMISSION_DENIED` (caught by `hasOnly` schema key enforcement)
7. **Payload 7 (Document ID Poisoning / Oversized ID Attack)**:
   - Target: `GET /sections/{1024-byte-junk-string}`
   - Expected Result: `PERMISSION_DENIED` (enforced by `isValidId()` pattern and size limits)
8. **Payload 8 (Public Modification of Published Content)**:
   - Target: `UPDATE /publishedContent/home`
   - Request: Anonymous visitor attempting to overwrite live homepage content
   - Expected Result: `PERMISSION_DENIED`
9. **Payload 9 (Audit Log Timestamp Spoofing)**:
   - Target: `CREATE /auditLogs/log-01`
   - Payload: Client-supplied timestamp from 1999
   - Expected Result: `PERMISSION_DENIED` (enforces `request.time` equality)
10. **Payload 10 (Media Deletion by Non-Admin)**:
    - Target: `DELETE /media/asset-01`
    - Request: Authenticated non-admin user
    - Expected Result: `PERMISSION_DENIED`
11. **Payload 11 (Terminal Revision Mutation)**:
    - Target: `UPDATE /revisions/rev-01`
    - Request: Any update to an existing revision snapshot
    - Expected Result: `PERMISSION_DENIED` (revisions are write-once)
12. **Payload 12 (Self-Assigned Role on Enrollment)**:
    - Target: `CREATE /adminAllowlist/new-user`
    - Request: Client attempting to enroll a new user with `role: "owner"`
    - Expected Result: `PERMISSION_DENIED` (can only be managed by existing verified owner)

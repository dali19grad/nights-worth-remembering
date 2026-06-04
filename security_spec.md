# Security Specifications for Nights Worth Remembering Database

## 1. Data Invariants
- **Write-Once Orders (Subscribers)**: Anyone can register an order/subscriber document during guest checkout, but once written, only verified administrators can view, alter, or remove registrations.
- **Identity Integrity**: No customer can query all orders/subscribers, since it contains private customer PII (Personal Identifiable Information) like name, email, and physical address. Only verified staff of the club (`dalilajaafar@gmx.de`) have permission to query, read, or process submissions.
- **Timestamp Integrity**: `createdAt` must exactly match the server execution time (`request.time`) during document creation.
- **Schema Conformity**: Fields must be strictly validated for type, correct sizes, matches, and completeness to prevent ID poisonings, shadow fields, or wallet-exhausting long inputs.

## 2. The "Dirty Dozen" Malicious Payloads (Permission Denied Verification)

Here are the 12 payloads representing security threats designed to bypass permissions, which are strictly blocked:

1. **Unauthenticated List Exploits**: Querying all `/subscribers` as an unauthenticated attacker.
2. **Anonymous Reader Intrusion**: Trying to fetch a single subscriber registration as an authenticated non-admin user.
3. **Shadow Fields Insertion**: Attempting to create a subscriber registration with unexpected key-value pairs (e.g. `{ "firstName": "A", ..., "isVerifiedAdmin": true }`)
4. **Malicious Role Promotion**: Creating an admin document with standard access when not matching the owner email.
5. **Privilege Escalation**: Attempting to alter a subscriber's status to `active` without admin authentication.
6. **Self-Admin Spoofing**: Attempting to create an admin entry using someone else's UID or custom parameters.
7. **Bypassing Timestamp Validation**: Sending a mock long-ago `createdAt` client timestamp instead of relying on the Firestore server timestamp.
8. **Denial of Wallet Long Names**: Attempting to send a first name or street address exceeding string bounds (e.g., a 10KB string).
9. **Invalid Email Spoofing**: Submitting fields with improperly formatted email strings or non-matching inputs.
10. **Document ID Poisoning**: Specifying an extremely long, junk-character document ID to subvert caching or cause indices corruption.
11. **Relational Sync Vulnerability**: Trying to create records referencing non-existent states or fake databases.
12. **Modifying Immortal Fields**: Attempting to alter `createdAt` on an existing subscriber registration.

## 3. The Rules Architecture (`DRAFT_firestore.rules`)
We will enforce this with Attribute-Based Access Control checking standard claims (`request.auth.token.email` & `request.auth.token.email_verified`), validating precise schemas on both `create` and `update` via helper routines `isValidSubscriber(data)` and `incoming().diff(existing()).affectedKeys().hasOnly([...])`.

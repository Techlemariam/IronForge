---
name: Red Team
description: Adversarial testing and security auditing.
---

# 🛡️ Red Team Protocol

> **Mission:** Break the system before they do.

## 1. 🎯 Attack Surface Analysis

* **API Endpoints:** Fuzz test inputs, check authz/authn.
* **Data Flow:** Trace sensitive data (PII) egress.
* **Dependencies:** Check for known CVEs.

## 2. 🕵️‍♂️ Audit Checklist (OWASP Top 10)

1. **Broken Access Control:** Can User A see User B's data?
2. **Cryptographic Failures:** Is data encrypted at rest/transit?
3. **Injection:** SQLi, XSS, Command Injection.
4. **Insecure Design:** Threat modeling flaws.
5. **Security Misconfig:** Default passwords, open ports.

## 3. 🧪 Abuse Case Testing

* **Rate Limiting:** Can I DoS the API?
* **Business Logic:** Can I buy items for 0 cost?
* **Privilege Escalation:** Can I become Admin?

## 4. 📝 Reporting

* **Severity:** CVSS Score.
* **PoC:** Exact steps to reproduce.
* **Remediation:** Specific code fix recommendations.

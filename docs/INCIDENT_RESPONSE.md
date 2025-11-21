# Security Incident Response Playbook

**Last Updated**: November 17, 2025
**Version**: 1.0
**Owner**: Security Team

---

## 📋 Table of Contents

1. [Overview & Goals](#overview--goals)
2. [Incident Classification](#incident-classification)
3. [Response Procedures](#response-procedures)
4. [Communication Plan](#communication-plan)
5. [Recovery & Lessons Learned](#recovery--lessons-learned)
6. [Contact Information](#contact-information)

---

## Overview & Goals

### Purpose
This playbook provides step-by-step procedures for responding to security incidents affecting the TypeScript REST API project.

### Goals
- **Minimize Impact**: Limit scope and duration of security incidents
- **Preserve Evidence**: Maintain forensic integrity for investigation
- **Communicate Transparently**: Keep stakeholders informed
- **Learn & Improve**: Use incidents to strengthen security

### Severity Levels

| Level | Response Time | Examples | Impact |
|-------|---------------|----------|--------|
| **Critical** | Immediate (< 1 hour) | Data breach, RCE, complete service outage | Affects all users, data compromised |
| **High** | Urgent (< 4 hours) | Vulnerability allowing auth bypass | Affects subset of users or features |
| **Medium** | Standard (< 24 hours) | Privilege escalation bug | Limited user impact, temporary access |
| **Low** | Planning (< 7 days) | Information disclosure | No immediate user impact |

---

## Incident Classification

### Type 1: Unauthorized Access / Data Breach

**Indicators**:
- Unusual login patterns
- Data access logs showing anomalies
- External parties accessing resources
- Credential leaks detected

**Initial Actions**:
```bash
IMMEDIATE (0-15 minutes):
1. [ ] Activate incident response team (Slack #security)
2. [ ] Isolate affected systems (disable account if human breach)
3. [ ] Preserve logs and audit trail (do not rotate)
4. [ ] Page on-call security engineer

IMMEDIATE (15-30 minutes):
1. [ ] Determine scope (which users/data affected)
2. [ ] Stop unauthorized access (reset credentials, revoke tokens)
3. [ ] Enable enhanced logging for investigation
4. [ ] Notify system owner and manager

IMMEDIATE (30-60 minutes):
1. [ ] Conduct initial investigation (timeline of events)
2. [ ] Identify root cause (compromised password, exposed key, vulnerability)
3. [ ] Prepare incident summary for stakeholders
4. [ ] Begin communication to affected users
```

---

### Type 2: Vulnerability / Exploit Detection

**Indicators**:
- Scanner detects new vulnerability (OWASP)
- Exploit code published
- Dependency has critical CVE
- Unusual error patterns in logs

**Initial Actions**:
```bash
IMMEDIATE (0-1 hour):
1. [ ] Verify vulnerability exists in our codebase
2. [ ] Assess exploitability (can it really be exploited?)
3. [ ] Check if already being exploited (look at logs)
4. [ ] Estimate affected versions/deployments

WITHIN 4 HOURS:
1. [ ] Develop and test patch
2. [ ] Create pull request with fix
3. [ ] Get security team approval
4. [ ] Merge to main and deploy hotfix

WITHIN 24 HOURS:
1. [ ] Release patch version
2. [ ] Publish security advisory (if external)
3. [ ] Update documentation
4. [ ] Notify users (if critical)
```

---

### Type 3: Suspicious Activity / Anomaly Detection

**Indicators**:
- Spike in failed login attempts
- Unusual geographic access patterns
- Rate limit threshold exceeded
- Repeated requests to non-existent endpoints

**Initial Actions**:
```bash
WITHIN 24 HOURS:
1. [ ] Analyze logs for root cause
2. [ ] Determine if attack (intentional) or misconfiguration
3. [ ] Monitor for escalation
4. [ ] Implement countermeasures if needed

EXAMPLES OF COUNTERMEASURES:
- Increase rate limiting
- Add IP to blocklist
- Adjust alerting thresholds
- Review access logs for compromise
```

---

### Type 4: Denial of Service (DDoS)

**Indicators**:
- Service unavailable to legitimate users
- Spike in traffic from single IP/range
- Error rates 100%
- Resource usage (CPU, memory) maxed out

**Initial Actions**:
```bash
IMMEDIATE (0-15 minutes):
1. [ ] Confirm DDoS (not actual service issue)
   - Check: Is service responding? (health check)
   - Check: Error logs (rate limit, connection errors)
   - Check: Traffic patterns (spike from single source)

2. [ ] Enable DDoS protection
   - Activate CloudFlare/AWS Shield
   - Enable rate limiting at edge
   - Consider geo-blocking if attack is regional

3. [ ] Maintain visibility
   - Monitor traffic patterns
   - Check real user access
   - Ensure critical services online

WITHIN 1 HOUR:
1. [ ] Scale infrastructure if needed
2. [ ] Adjust firewall rules
3. [ ] Communicate status to users
```

---

### Type 5: Infrastructure / Deployment Issue

**Indicators**:
- Failed deployment
- Configuration drift
- Certificate expiration
- Database connection issues

**Initial Actions**:
```bash
IMMEDIATE:
1. [ ] Determine impact (which services affected)
2. [ ] Roll back to previous working version if needed
3. [ ] Assess if security-related

IF SECURITY-RELATED:
1. [ ] Follow vulnerability incident procedures
2. [ ] Audit configuration changes
3. [ ] Check audit logs for who made change

IF NOT SECURITY-RELATED:
1. [ ] Follow standard incident procedures
2. [ ] Focus on service restoration
3. [ ] Document root cause for prevention
```

---

## Response Procedures

### Phase 1: Detection & Triage (0-30 minutes)

#### Step 1.1: Confirm Incident
```text
Questions to answer:
[ ] Is this a real security incident or false alarm?
[ ] What system is affected?
[ ] When did it start?
[ ] Is it still ongoing?
[ ] Who discovered it (internal alert, external report, user complaint)?
```

#### Step 1.2: Initial Assessment
```bash
[ ] Severity level (Critical/High/Medium/Low)
[ ] Affected components (API, database, infrastructure, etc.)
[ ] Affected users (how many, which types)
[ ] Affected data (PII, credentials, business data, etc.)
[ ] Obvious root cause (if any)
```

#### Step 1.3: Assemble Response Team
```bash
ALWAYS INCLUDE:
[ ] Security lead (decision maker)
[ ] On-call engineer (mitigation)
[ ] Product manager (business impact)
[ ] Communications lead (stakeholder updates)

SOMETIMES INCLUDE:
[ ] Database expert (if data involved)
[ ] Infrastructure expert (if deployment/network)
[ ] Legal/Compliance (if regulatory impact)
```

#### Step 1.4: Create Incident Ticket
```text
Template:
- Title: [INCIDENT] Description (Severity: HIGH)
- Labels: security, incident, severity-high
- Assignees: Response team leads
- Description:
  * What happened (initial observations)
  * When discovered
  * Current status
  * Immediate actions taken
  * Next steps
```

### Phase 2: Investigation & Mitigation (30 minutes - 4 hours)

#### Step 2.1: Preserve Evidence
```bash
DO NOT:
[ ] Delete logs or audit trails
[ ] Restart services (unless necessary for containment)
[ ] Modify configuration
[ ] Clean up artifacts

DO:
[ ] Copy logs to secure location
[ ] Take snapshots of system state
[ ] Document everything done
[ ] Enable enhanced logging for investigation
```

#### Step 2.2: Contain the Incident
```bash
Containment strategies depend on type:

DATA BREACH:
  [ ] Revoke compromised credentials
  [ ] Revoke compromised tokens
  [ ] Block compromised accounts
  [ ] Increase monitoring on affected accounts

VULNERABILITY:
  [ ] Disable vulnerable feature (if possible)
  [ ] Reduce exposure (whitelist IPs, rate limit)
  [ ] Plan hotfix deployment

DDoS:
  [ ] Enable edge protection (CloudFlare)
  [ ] Increase rate limiting
  [ ] Scale infrastructure
  [ ] Block malicious IPs
```

#### Step 2.3: Investigate Root Cause
```bash
Questions to answer:
[ ] How did the attacker/issue gain access?
[ ] What was the attack vector? (credential, vulnerability, misconfiguration)
[ ] Was there a triggering event? (deploy, configuration change, exposure)
[ ] How long was it going on?
[ ] What systems were accessed?
[ ] What data was affected?
[ ] How can we tell if someone else used this?
```

#### Step 2.4: Develop Fix
```bash
FOR VULNERABILITIES:
[ ] Create patch in isolated branch
[ ] Add test cases to catch regression
[ ] Get security review approval
[ ] Test patch in staging

FOR MISCONFIGURATIONS:
[ ] Correct configuration
[ ] Deploy to staging first
[ ] Verify fix works
[ ] Plan rollout schedule

FOR COMPROMISED ACCOUNTS:
[ ] Password reset
[ ] 2FA re-enrollment
[ ] Token revocation
[ ] Session termination
```

#### Step 2.5: Deploy Fix
```bash
HOTFIX PROCESS:
1. [ ] Create feature branch: hotfix/incident-XXXXX
2. [ ] Implement fix and add tests
3. [ ] Get code review and security approval
4. [ ] Merge to main
5. [ ] Tag as release
6. [ ] Deploy to production
7. [ ] Verify fix in production
8. [ ] Update status
```

### Phase 3: Recovery & Communication (During & After)

#### Step 3.1: Communicate Timeline

**To Users (if impacted)**:
```bash
Initial notification (within 30 minutes):
"We've become aware of a security incident affecting service X.
We are investigating and will provide updates every 30 minutes."

Updates every 30 minutes:
"Current status: We have identified the issue. Our team is working on a fix."

Resolution notification:
"We have successfully resolved the issue. Service is fully operational.
Details will be shared in a post-mortem within 48 hours."

Post-mortem (within 24-48 hours):
"Details of what happened, what we learned, and how we're preventing it."
```

**To Internal Team**:
```bash
- Real-time updates in #incident channel
- Status updates every 30 minutes
- Status dashboard link
- Instructions for additional support needed
```

#### Step 3.2: System Recovery Checklist
```text
[ ] All systems back online
[ ] All services passing health checks
[ ] Monitoring showing normal patterns
[ ] Rate limits back to normal
[ ] Error rates normal
[ ] No ongoing suspicious activity
[ ] All backups verified
[ ] Database integrity verified
[ ] Logging and alerting verified
```

#### Step 3.3: Post-Incident Procedures
```bash
IMMEDIATE (within 1 hour of resolution):
[ ] Document everything in incident ticket
[ ] Collect logs and evidence
[ ] Get statement from each team member who worked incident
[ ] Create preliminary timeline

WITHIN 24 HOURS:
[ ] Host post-mortem meeting with team + stakeholders
[ ] Answer: What happened, why, how do we prevent it
[ ] Document action items and assign owners
[ ] Create public disclosure (if appropriate)

WITHIN 7 DAYS:
[ ] Complete all action items from post-mortem
[ ] Update security documentation
[ ] Update threat model
[ ] Train team on lessons learned
```

---

## Communication Plan

### Internal Communication

**Incident Channel** (`#incident`):
```bash
Real-time updates with:
- Current status
- Actions being taken
- ETA for resolution
- Questions for specific teams
```

**Executive Summary**:
```bash
To: CEO, Product Lead, VP Engineering
At: Every hour during incident

Format:
- Status (In Progress / Resolved)
- Impact (how many users, what data)
- Root cause (if known)
- ETA for resolution
- Follow-up actions
```

**All-Hands Notification**:
```bash
To: All staff (if critical)
At: After resolution

Format:
- What happened (plain language)
- When it was detected
- How quickly it was fixed
- What we're doing to prevent it
- No blame, focus on learning
```

### External Communication

**For Users (if impacted)**:
```bash
TIMING: Within 1 hour of incident detection
CHANNELS: Email + in-app notification + status page
CONTENT:
- Acknowledge incident
- Explain what's affected
- What we're doing
- Timeline for updates
- Expected resolution time

EXAMPLE:
"We've identified a security issue affecting user accounts.
We're working on a fix and will have it deployed within 2 hours.
We'll update you every 30 minutes. Thank you for your patience."
```

**For Media (if public)**:
```bash
TIMING: Only if incident is public or required for compliance
PREPARED BY: CEO + Communications + Legal
CONTENT:
- What happened (high level)
- When we discovered it
- How we responded
- How users can protect themselves
- Where to get more info (status page)
```

**Public Status Page**:
```bash
Update every 15 minutes during incident with:
- Current status
- Systems affected
- What we're doing
- ETA for resolution
- Link to incident post-mortem (after resolution)

Tool: StatusPage.io or similar
```

### Documentation & Transparency

**Incident Report Template**:
```markdown
# Incident Report: [Title]

## Executive Summary
- Severity: [Critical/High/Medium/Low]
- Duration: [X hours/minutes]
- Users Affected: [X accounts / X% of user base]
- Root Cause: [Brief explanation]

## Timeline
- HH:MM - Incident begins (often discovered much later)
- HH:MM - Incident detected (alert/report/discovery)
- HH:MM - Response team assembled
- HH:MM - Root cause identified
- HH:MM - Fix deployed
- HH:MM - Incident resolved

## Detailed Analysis
### What Happened
[Description of the incident, sequence of events]

### Why It Happened
[Root cause analysis, contributing factors]

### Scope of Impact
- Users affected: X
- Data exposed: [List specific data types]
- Systems down: [List services]
- Duration: [Time period]

## Response Actions
- Immediate containment
- Mitigation steps
- Fix deployment
- Verification

## Lessons Learned
### What Went Well
- [Positive aspects of response]

### What Could Be Better
- [Areas for improvement]

## Action Items
| Action | Owner | Due Date | Status |
|--------|-------|----------|--------|
| [Fix] | [Person] | [Date] | [] |

## Prevention
How will we prevent this in the future?
- Code changes
- Process improvements
- Monitoring improvements
- Documentation updates
```

---

## Recovery & Lessons Learned

### Post-Incident Meeting

**Schedule**: 24 hours after incident resolution
**Duration**: 60-90 minutes
**Attendees**: Response team + relevant stakeholders
**Facilitator**: Security lead (neutral)

**Agenda**:
```text
1. (5 min) Welcome & norms
   - No blame, focus on learning
   - Psychological safety

2. (15 min) Timeline review
   - What happened step by step
   - Key decision points

3. (20 min) Root cause analysis
   - Why did this happen?
   - Contributing factors
   - Not just technical (people, process, tools)

4. (20 min) Response analysis
   - What worked well?
   - What could be better?
   - Detection: were alerts fast enough?
   - Response: were processes clear?
   - Communication: were people informed?

5. (15 min) Action items
   - Specific, measurable, assigned
   - Realistic timelines
   - Focus on prevention, not blame

6. (5 min) Wrap-up & appreciation
```

### Action Items Examples

**Prevention**:
```sql
- Add test case to catch vulnerability
- Improve alert threshold
- Add new monitoring metric
- Update documentation
- Improve security training
```

**Process**:
```bash
- Update incident response playbook
- Create new runbook for this type
- Improve escalation process
- Update deployment checklist
- Improve communication templates
```

**Technology**:
```bash
- Implement new security control
- Add monitoring for this pattern
- Improve logging detail
- Add automated check to CI/CD
- Set up periodic security audit
```

### Tracking & Follow-up

```bash
GitHub Issue Template for Incident Actions:
---
Title: [INCIDENT-FOLLOWUP] Description

Type: incident-action
Severity: [critical/high/medium/low]
Incident: [Link to incident report]
Owner: [Person responsible]
Due: [Date]
Status: [in-progress/blocked/completed]

## Background
[Context from incident]

## Action
[What needs to be done]

## Acceptance Criteria
- [ ] Criterion 1
- [ ] Criterion 2
- [ ] Tests added
- [ ] Documentation updated

## Deadline
[Date and reason for timeline]
```

### Metrics & Trends

**Track over time**:
```text
- Mean time to detect (MTTD)
- Mean time to respond (MTTR)
- Mean time to resolve (MTTR)
- Incident frequency by type
- Severity distribution
- Root cause categories
```

**Monthly review**:
```text
Meeting to discuss:
- Incident trends
- Most common root causes
- Most impactful improvements
- Action item completion rate
- Areas needing investment
```

---

## Contact Information

### On-Call Schedule
```text
Primary: [Name] ([Phone])
Escalation: [Name] ([Phone])
Executive: [Name] ([Phone])

Available: 24/7/365
Incidents: Page immediately
Updates: Every 30 minutes during incident
```

### Contact Methods
```bash
URGENT (incident in progress):
- Phone: [Number]
- PagerDuty: [Link]
- Slack: @on-call

REPORT SECURITY ISSUE:
- Email: security@example.com
- Form: [Security reporting form]
- HackerOne: [Program link]

FOLLOW-UP QUESTIONS:
- Email: incident@example.com
- Public: [Status page]
```

### Escalation Matrix
```text
Level 1 (On-call engineer):
- Severity Low/Medium
- Can respond within 1 hour
- Has access to system

Level 2 (Security lead):
- Severity High/Critical
- Needs technical expertise
- Makes containment decisions

Level 3 (VP Engineering/CEO):
- Severity Critical
- Requires business decision
- Public disclosure decision
```

---

## Appendix: Incident Checklists

### DDoS Incident Checklist
```bash
[ ] Confirm DDoS (not actual service failure)
[ ] Enable CloudFlare protection
[ ] Increase rate limiting
[ ] Monitor traffic patterns
[ ] Document attack pattern
[ ] Scale infrastructure if needed
[ ] Adjust firewall rules
[ ] Notify status page
[ ] After incident: analyze and improve
```

### Data Breach Checklist
```bash
[ ] Confirm data access
[ ] Identify accessed data
[ ] Notify affected users (24 hours)
[ ] Revoke compromised credentials
[ ] Audit access logs
[ ] Check for lateral movement
[ ] Update security measures
[ ] Report to authorities (if required)
[ ] Document lessons learned
```

### Service Outage Checklist
```bash
[ ] Confirm outage scope
[ ] Start incident response
[ ] Investigate root cause
[ ] Roll back if needed
[ ] Deploy fix
[ ] Verify service
[ ] Communicate status
[ ] Monitor for recurrence
[ ] Post-mortem within 24 hours
```

---

**This playbook is maintained and updated regularly.**
**Last Review**: November 17, 2025
**Next Review**: February 17, 2026
**Owner**: Security Team
**Version Control**: GitHub (in repo)

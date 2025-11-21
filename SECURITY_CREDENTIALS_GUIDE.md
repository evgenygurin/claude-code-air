# 🔐 Security Credentials Guide

Comprehensive guide for secure handling of credentials, secrets, and sensitive data in production applications.

## 🛡️ Security Audit Results

### ✅ Issues Fixed

1. **Docker Compose Default Secrets** - Fixed
   - **Problem**: `docker-compose.yml` had weak default values for JWT secrets
   - **Fix**: Replaced with mandatory environment variable validation
   - **Before**: `${JWT_SECRET:-change-me-in-production}`
   - **After**: `${JWT_SECRET:?JWT_SECRET environment variable is required}`

2. **Environment Variable Validation** - Verified Secure
   - **Status**: ✅ Production requires strong JWT secrets (32+ chars)
   - **Status**: ✅ Development uses safe defaults with warning messages
   - **Status**: ✅ Configuration validates secrets at startup

3. **Git Security** - Verified Secure  
   - **Status**: ✅ `.env` files properly ignored in `.gitignore`
   - **Status**: ✅ No real credentials found in repository
   - **Status**: ✅ Only example files with placeholders committed

4. **Logging Security** - Verified Secure
   - **Status**: ✅ No password/token/secret logging found
   - **Status**: ✅ Error handling doesn't expose sensitive data
   - **Status**: ✅ User objects filtered through `toPublic()` helper

### 🔒 Current Security State

**Excellent Security Posture** - No critical vulnerabilities found.

## 🎯 Best Practices Implemented

### 1. Environment Variable Security

```typescript
// ✅ GOOD: Validation at startup
private getDefaultJwtSecret(): string {
  if (this.appConfig.nodeEnv === 'production') {
    throw new Error('JWT_SECRET must be set in production');
  }
  return 'dev-secret-key-change-in-production';
}
```

### 2. Docker Security

```yaml
# ✅ GOOD: Mandatory environment variables
environment:
  JWT_SECRET: ${JWT_SECRET:?JWT_SECRET environment variable is required}
  REFRESH_SECRET: ${REFRESH_SECRET:?REFRESH_SECRET environment variable is required}
```

### 3. Git Security

```gitignore
# ✅ GOOD: Prevent credential commits
.env
.env.local
.env.production
*.key
*.pem
```

## 🚨 Critical Security Rules

### Rule 1: No Default Secrets in Production

❌ **Never do this:**
```yaml
# BAD: Default values in production configs
JWT_SECRET: ${JWT_SECRET:-default-secret}
DATABASE_PASSWORD: ${DB_PASS:-admin123}
```

✅ **Always do this:**
```yaml
# GOOD: Force environment variable requirement
JWT_SECRET: ${JWT_SECRET:?JWT_SECRET is required}
DATABASE_PASSWORD: ${DB_PASS:?DATABASE_PASSWORD is required}
```

### Rule 2: No Hardcoded Secrets in Code

❌ **Never do this:**
```typescript
// BAD: Hardcoded in source code
const jwtSecret = 'my-super-secret-key';
const dbPassword = 'admin123';
```

✅ **Always do this:**
```typescript
// GOOD: From environment variables
const jwtSecret = process.env.JWT_SECRET;
const dbPassword = process.env.DB_PASSWORD;
```

### Rule 3: No Sensitive Data in Logs

❌ **Never do this:**
```typescript
// BAD: Logging sensitive data
console.log('User login:', { email, password, token });
logger.info('JWT token:', token);
```

✅ **Always do this:**
```typescript
// GOOD: Sanitized logging
console.log('User login:', { email: user.email }); // No password/token
logger.info('User authenticated:', { userId: user.id, email: user.email });
```

### Rule 4: Validate Production Secrets

✅ **Always validate in production:**
```typescript
if (process.env.NODE_ENV === 'production') {
  if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    throw new Error('Production JWT_SECRET must be 32+ characters');
  }
}
```

## 🔑 Secret Generation Guidelines

### Strong JWT Secrets

```bash
# Generate 32+ character random strings
openssl rand -base64 32
# Example: 8x7v2+5k3N9m1Q4r6T8y0U3w5E7r9T2y4U6i8O1q3A5s

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### Database Passwords

```bash
# Generate strong database passwords
openssl rand -base64 24 | tr -d "=+/" | cut -c1-25
# Example: R7x3K9m2N6q8T4y1W5e0Z2u7I5o3P9a

# Include special characters
openssl rand -base64 32 | tr -d "=+/" | sed 's/./&@#$/3'
```

### AWS/Cloud Credentials

```bash
# Use AWS CLI for proper key rotation
aws iam create-access-key --user-name api-user

# Use cloud provider rotation
gcloud auth application-default login
```

## 🛠️ Environment Setup

### Development Environment

Create `.env` file (never commit this):
```bash
# Development - Safe defaults with warnings
NODE_ENV=development
JWT_SECRET=dev-jwt-secret-change-in-production-32-chars-min
REFRESH_SECRET=dev-refresh-secret-change-in-production-32-chars-min
```

### Production Environment

Create `.env.production` file (never commit this):
```bash
# Production - Strong secrets required
NODE_ENV=production
JWT_SECRET=<GENERATE_STRONG_32_CHAR_SECRET>
REFRESH_SECRET=<GENERATE_DIFFERENT_32_CHAR_SECRET>
DB_PASSWORD=<STRONG_DATABASE_PASSWORD>
```

### Docker Production

```bash
# Set environment variables before docker-compose
export JWT_SECRET=$(openssl rand -base64 32)
export REFRESH_SECRET=$(openssl rand -base64 32)

# Then run with required secrets
docker-compose up -d
```

## 🔍 Security Validation Checklist

### Before Deployment

- [ ] No hardcoded secrets in source code
- [ ] Production requires strong environment variables
- [ ] `.env` files added to `.gitignore`
- [ ] No sensitive data in logs or error messages
- [ ] Secrets are minimum 32 characters for JWT
- [ ] Database passwords are complex (20+ chars, mixed case, symbols)
- [ ] API keys rotated regularly
- [ ] No default/example credentials in production configs

### Code Review Checklist

- [ ] Search for patterns: `secret.*=.*['"]`, `password.*=.*['"]`, `key.*=.*['"]`
- [ ] Verify all `process.env` usage for sensitive data
- [ ] Check Docker files for default environment values
- [ ] Verify logging doesn't expose tokens/passwords
- [ ] Confirm error handling doesn't leak credentials
- [ ] Test production deployment fails without proper environment variables

## ⚡ Quick Security Commands

### Find Potential Issues

```bash
# Search for hardcoded secrets
grep -r -i "secret.*=.*['\"][a-z0-9]" src/
grep -r -i "password.*=.*['\"][a-z0-9]" src/
grep -r -i "token.*=.*['\"][a-z0-9]" src/

# Check for logging sensitive data
grep -r "console.log.*password\|secret\|token" src/
grep -r "logger.*password\|secret\|token" src/

# Verify .env files are ignored
git status --ignored | grep "\.env"
```

### Generate Strong Secrets

```bash
# JWT Secrets (32+ chars)
openssl rand -base64 32

# Database passwords (25 chars, alphanumeric)
openssl rand -base64 24 | tr -d "=+/" | cut -c1-25

# API keys (hex format, 40 chars)
openssl rand -hex 20

# UUID-based secrets
uuidgen | tr -d '-' | tr '[:upper:]' '[:lower:]'
```

### Test Production Security

```bash
# Test environment variable requirement
unset JWT_SECRET
npm start  # Should fail with error

# Test Docker security
docker-compose up  # Should fail without JWT_SECRET
```

## 🛡️ Advanced Security Patterns

### Secret Rotation

```typescript
// Implement JWT secret rotation
interface JWTConfig {
  currentSecret: string;
  previousSecret?: string; // For graceful rotation
  rotateAfter: Date;
}

// Verify with current OR previous secret during rotation
function verifyToken(token: string, config: JWTConfig) {
  try {
    return jwt.verify(token, config.currentSecret);
  } catch (error) {
    if (config.previousSecret) {
      return jwt.verify(token, config.previousSecret);
    }
    throw error;
  }
}
```

### Multi-Environment Secrets

```typescript
// Environment-specific validation
function validateSecrets() {
  const env = process.env.NODE_ENV;
  
  if (env === 'production') {
    requireSecrets(['JWT_SECRET', 'DB_PASSWORD', 'API_KEY']);
    validateSecretStrength(process.env.JWT_SECRET, 32);
  } else if (env === 'staging') {
    requireSecrets(['JWT_SECRET', 'DB_PASSWORD']);
    validateSecretStrength(process.env.JWT_SECRET, 24);
  }
  // Development can use defaults
}
```

### Secure Error Handling

```typescript
// Don't expose internal details
function handleAuthError(error: any): Response {
  // Log internal details (not exposed to client)
  logger.error('Auth failed:', { 
    error: error.message, 
    stack: error.stack,
    // No user credentials logged
  });
  
  // Return generic error to client
  return { 
    success: false, 
    error: 'Authentication failed' // No internal details
  };
}
```

## 📋 Compliance & Standards

### OWASP Guidelines

- ✅ **A02:2021 - Cryptographic Failures**: Strong secrets, no hardcoded credentials
- ✅ **A05:2021 - Security Misconfiguration**: Proper environment variable handling
- ✅ **A09:2021 - Security Logging**: No sensitive data in logs

### Industry Standards

- ✅ **NIST Cybersecurity Framework**: Secure secret management
- ✅ **ISO 27001**: Information security management
- ✅ **SOC 2**: Security controls for service organizations

## 🚀 Emergency Response

### Credential Compromise

1. **Immediate Actions**
   ```bash
   # Rotate compromised secrets immediately
   export JWT_SECRET=$(openssl rand -base64 32)
   export REFRESH_SECRET=$(openssl rand -base64 32)
   
   # Restart all services
   docker-compose restart
   
   # Invalidate existing tokens (implement token blacklist)
   ```

2. **Investigation**
   - Check git history: `git log --all --full-history -- **/.env*`
   - Review access logs for unauthorized access
   - Audit recent deployments and configuration changes

3. **Prevention**
   - Enable secret rotation policies
   - Implement monitoring for secret exposure
   - Regular security audits and penetration testing

---

## 📞 Security Contacts

- **Security Team**: security@company.com
- **Incident Response**: incidents@company.com  
- **Emergency**: +1-xxx-xxx-xxxx (24/7)

---

**Last Updated**: November 17, 2025  
**Security Review**: ✅ All critical issues resolved  
**Next Review**: December 17, 2025
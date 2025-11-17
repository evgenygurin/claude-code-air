# Claude on 3rd-Party Platforms - Documentation Index

Complete guide to using Anthropic's Claude models on AWS Bedrock and Google Vertex AI.

## 📚 Documentation Structure

```
claude-3rd-party-platforms/
├── INDEX.md                          # This file
├── QUICKSTART.md                     # 5-minute quick start (START HERE!)
├── README.md                         # Complete overview & best practices
├── bedrock-setup-guide.md            # AWS Bedrock detailed setup
├── vertex-ai-setup-guide.md          # Google Vertex AI detailed setup
└── code-examples.md                  # Practical code examples
```

## 🚀 Getting Started

### New Users: Start Here
1. **Read**: [QUICKSTART.md](./QUICKSTART.md) (5 minutes)
2. **Choose**: AWS Bedrock or Google Vertex AI
3. **Setup**: Follow platform-specific guide
4. **Code**: Check [code-examples.md](./code-examples.md)

### AWS Bedrock Users
1. Quick Start: [QUICKSTART.md](./QUICKSTART.md#-aws-bedrock)
2. Full Setup: [bedrock-setup-guide.md](./bedrock-setup-guide.md)
3. Examples: [code-examples.md](./code-examples.md)
4. Reference: [README.md](./README.md#amazon-bedrock)

### Google Vertex AI Users
1. Quick Start: [QUICKSTART.md](./QUICKSTART.md#-google-vertex-ai)
2. Full Setup: [vertex-ai-setup-guide.md](./vertex-ai-setup-guide.md)
3. Examples: [code-examples.md](./code-examples.md)
4. Reference: [README.md](./README.md#google-vertex-ai)

## 📖 Complete File Descriptions

### QUICKSTART.md (8 KB)
**Purpose**: Get running in 5 minutes
- Quick start for both platforms
- Side-by-side comparison
- Common tasks with code
- Model IDs for all versions
- Troubleshooting basics
- Cost optimization tips

**Best for**: New users, quick reference

### README.md (16 KB)
**Purpose**: Complete overview and best practices
- Platform overview
- Setup instructions (condensed)
- Available models (with regional info)
- Quick comparison table
- Model availability by region
- 7 best practice categories
- Additional resources

**Best for**: Understanding both platforms, decision making

### bedrock-setup-guide.md (12 KB)
**Purpose**: AWS Bedrock complete setup
- Step-by-step installation (3 steps)
- AWS CLI setup and verification
- Credential configuration (3 methods)
- Bedrock model access
- SDK installation (3 options)
- Test connection (Python & TypeScript)
- Comprehensive troubleshooting
- Security best practices
- Advanced configuration
- Monitoring and costs
- Regional availability

**Best for**: AWS Bedrock users, detailed guidance

### vertex-ai-setup-guide.md (12 KB)
**Purpose**: Google Vertex AI complete setup
- Step-by-step installation
- Google Cloud SDK setup
- GCP authentication (2 methods)
- Project configuration
- IAM permissions setup
- SDK installation (2 options)
- Test connection (Python & TypeScript)
- Comprehensive troubleshooting
- Security best practices
- Advanced configuration
- Monitoring and costs
- Regional endpoints guide

**Best for**: Vertex AI users, detailed guidance

### code-examples.md (16 KB)
**Purpose**: Production-ready code examples
- Basic usage (Python & TypeScript)
- Error handling (with retries)
- Streaming responses
- Vision/image handling
- System prompts
- Multi-turn conversations
- Function calling (tool use)
- Batch processing
- Prompt caching
- Best practices summary
- Common issues & solutions

**Best for**: Implementation, copy-paste ready code

## 🎯 Common Scenarios

### "I want to use Claude on AWS"
1. Read: [QUICKSTART.md](./QUICKSTART.md#-aws-bedrock)
2. Follow: [bedrock-setup-guide.md](./bedrock-setup-guide.md) (Step 1-5)
3. Copy code: [code-examples.md](./code-examples.md#basic-usage) (Bedrock - Python)

### "I want to use Claude on Google Cloud"
1. Read: [QUICKSTART.md](./QUICKSTART.md#-google-vertex-ai)
2. Follow: [vertex-ai-setup-guide.md](./vertex-ai-setup-guide.md) (Step 1-5)
3. Copy code: [code-examples.md](./code-examples.md#basic-usage) (Vertex AI - Python)

### "I'm getting an authentication error"
- Bedrock: See [bedrock-setup-guide.md - Troubleshooting](./bedrock-setup-guide.md#troubleshooting)
- Vertex AI: See [vertex-ai-setup-guide.md - Troubleshooting](./vertex-ai-setup-guide.md#troubleshooting)

### "I want to see code examples"
→ [code-examples.md](./code-examples.md) - 8 different patterns with explanations

### "I want to compare both platforms"
→ [QUICKSTART.md - Comparison](./QUICKSTART.md#side-by-side-comparison) or [README.md - Quick Comparison](./README.md#quick-comparison)

### "I need to optimize costs"
- [QUICKSTART.md - Cost Optimization](./QUICKSTART.md#cost-optimization)
- [README.md - Cost Optimization](./README.md#5-cost-optimization)
- [bedrock-setup-guide.md - Monitoring & Costs](./bedrock-setup-guide.md#monitoring--costs)
- [vertex-ai-setup-guide.md - Monitoring & Costs](./vertex-ai-setup-guide.md#monitoring--costs)

### "I need regional data residency"
→ [README.md - Global vs regional endpoints](./README.md#global-vs-regional-endpoints)

## 📊 Documentation Statistics

| File | Lines | Size | Focus |
|------|-------|------|-------|
| QUICKSTART.md | ~250 | 8 KB | Getting started |
| README.md | ~520 | 16 KB | Overview & reference |
| bedrock-setup-guide.md | ~414 | 12 KB | AWS Bedrock |
| vertex-ai-setup-guide.md | ~500 | 12 KB | Google Vertex AI |
| code-examples.md | ~608 | 16 KB | Code examples |
| **Total** | **~2,300** | **~64 KB** | Complete guide |

## 🔑 Key Features Covered

### Core Features
- ✅ Basic message creation
- ✅ Streaming responses
- ✅ Vision/image input
- ✅ System prompts
- ✅ Multi-turn conversations
- ✅ Function calling (tool use)

### Authentication
- ✅ AWS IAM roles
- ✅ AWS credential profiles
- ✅ GCP service accounts
- ✅ GCP default credentials
- ✅ Temporary credentials

### Error Handling
- ✅ Rate limit handling
- ✅ Exponential backoff
- ✅ Retry strategies
- ✅ Error classification
- ✅ Logging & monitoring

### Deployment
- ✅ EC2 / Lambda (Bedrock)
- ✅ Cloud Run / AppEngine (Vertex)
- ✅ IAM permissions setup
- ✅ Cost monitoring
- ✅ Activity logging

## 🌟 Recommended Reading Order

### For AWS Users
1. [QUICKSTART.md - Bedrock section](./QUICKSTART.md#-aws-bedrock)
2. [bedrock-setup-guide.md - Steps 1-5](./bedrock-setup-guide.md#step-1-install-aws-cli)
3. [code-examples.md - Bedrock examples](./code-examples.md#bedrock---python)
4. [README.md - Best Practices](./README.md#best-practices)

### For Google Cloud Users
1. [QUICKSTART.md - Vertex section](./QUICKSTART.md#-google-vertex-ai)
2. [vertex-ai-setup-guide.md - Steps 1-5](./vertex-ai-setup-guide.md#step-1-install-google-cloud-sdk)
3. [code-examples.md - Vertex examples](./code-examples.md#vertex-ai---python)
4. [README.md - Best Practices](./README.md#best-practices)

### For Advanced Users
1. [README.md - Complete overview](./README.md)
2. Platform-specific advanced sections:
   - [bedrock-setup-guide.md - Advanced Configuration](./bedrock-setup-guide.md#advanced-configuration)
   - [vertex-ai-setup-guide.md - Provisioned Throughput](./vertex-ai-setup-guide.md#provisioned-throughput-advanced)
3. [code-examples.md - Advanced Patterns](./code-examples.md#advanced-patterns)

## 💡 Quick Tips

**Choose Bedrock if:**
- Using AWS infrastructure
- Need simple authentication with IAM roles
- Already paying AWS bills
- Want pay-as-you-go without regional premium

**Choose Vertex AI if:**
- Using Google Cloud infrastructure
- Need regional data residency
- Want multi-region failover
- Already paying GCP bills

**Both platforms have:**
- Same Claude models
- Nearly identical APIs
- Global and regional endpoints
- Pay-as-you-go pricing
- Comprehensive monitoring

## 🔗 External Resources

- [Anthropic Documentation](https://docs.anthropic.com)
- [Claude API Reference](https://docs.anthropic.com/reference/getting-started)
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Google Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)

## 📝 Document Versions

- **Created**: November 2025
- **Last Updated**: November 2025
- **Status**: ✅ Production Ready
- **Tested**: Both AWS Bedrock and Google Vertex AI

---

## ✨ Quick Navigation

**Just want to code?** → [QUICKSTART.md](./QUICKSTART.md)

**Need detailed setup?** → [bedrock-setup-guide.md](./bedrock-setup-guide.md) or [vertex-ai-setup-guide.md](./vertex-ai-setup-guide.md)

**Want code examples?** → [code-examples.md](./code-examples.md)

**Need full reference?** → [README.md](./README.md)

**Troubleshooting?** → Platform-specific setup guide sections

---

**Happy coding with Claude on 3rd-party platforms! 🚀**

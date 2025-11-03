# 🏥 CuraLink - Rare Disease Research Platform

CuraLink is a comprehensive platform connecting patients with rare diseases to clinical trials, researchers, and expert communities. Built with Next.js, TypeScript, and AI-powered assistance.

![CuraLink Platform](https://img.shields.io/badge/Next.js-13.5-black?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.2-blue?style=for-the-badge&logo=typescript)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon-316192?style=for-the-badge&logo=postgresql)
![Drizzle ORM](https://img.shields.io/badge/Drizzle-ORM-green?style=for-the-badge)

## ✨ Features

### 👨‍⚕️ For Patients
- 🔍 **Smart Disease Search** - AI-powered search with spell correction for rare diseases
- 🧪 **Clinical Trials Matching** - Find relevant clinical trials based on your condition
- 📚 **Research Publications** - Access latest medical research and publications
- 👥 **Expert Directory** - Connect with researchers and medical experts via ORCID integration
- 💬 **Community Forums** - Engage with other patients and share experiences
- 📅 **Appointment Management** - Schedule and track appointments with researchers
- ⭐ **Favorites & Bookmarks** - Save trials, publications, and experts for easy access
- 🤖 **AI FAQ Assistant** - Get instant answers powered by Google Gemini AI

### 👩‍🔬 For Researchers
- 📊 **Analytics Dashboard** - Track engagement and research impact
- 🔬 **Trial Management** - Publish and manage clinical trial information
- 🤝 **Collaboration Tools** - Connect with other researchers and patients
- 🏅 **ORCID Integration** - Showcase verified credentials and publications
- 📈 **Patient Insights** - Understand patient needs and demographics
- 🔔 **Real-time Notifications** - Stay updated on patient inquiries and collaborations

### 🤖 AI-Powered Features
- **Gemini AI Integration** - Smart chatbot for medical FAQs
- **Spell Correction** - Intelligent disease name correction
- **Content Recommendations** - Personalized trial and publication suggestions

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ or higher
- PostgreSQL database (we recommend [Neon](https://neon.tech) for serverless PostgreSQL)
- Yarn or npm package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/Chandra-Sekhar-Dutta/CuraLink.git
   cd CuraLink
   ```

2. **Install dependencies**
   ```bash
   yarn install
   # or
   npm install
   ```

3. **Set up environment variables**
   
   Copy the `.env.example` file to `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

   Fill in your environment variables:
   ```env
   # Required
   DATABASE_URL=your-postgresql-connection-string
   NEXTAUTH_SECRET=your-secret-key
   GEMINI_API_KEY=your-gemini-api-key

   # Optional (for email features)
   EMAIL_SERVER_HOST=smtp.gmail.com
   EMAIL_SERVER_USER=your-email@gmail.com
   EMAIL_SERVER_PASSWORD=your-app-password
   ```

4. **Set up the database**
   ```bash
   # Generate migration files
   yarn db:generate

   # Run migrations
   yarn db:migrate
   ```

5. **Run the development server**
   ```bash
   yarn dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

## 🔑 API Keys Setup

### Google Gemini AI (Required)
1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Create a new API key
3. Add to `.env.local` as `GEMINI_API_KEY`

### Database (Required)
1. Create a free PostgreSQL database at [Neon](https://neon.tech)
2. Copy the connection string
3. Add to `.env.local` as `DATABASE_URL`

### NextAuth Secret (Required)
Generate a secure secret:
```bash
openssl rand -base64 32
```
Add to `.env.local` as `NEXTAUTH_SECRET`

### ORCID OAuth (Optional)
For researcher authentication:
1. Register your application at [ORCID Developer Tools](https://orcid.org/developer-tools)
2. Get your Client ID and Secret
3. Add to `.env.local`:
   ```
   ORCID_CLIENT_ID=your-client-id
   ORCID_CLIENT_SECRET=your-client-secret
   ```

### Email Service (Optional)
For user verification emails:
- **Gmail**: Enable 2FA and create an App Password
- **SendGrid**: Get API key from SendGrid dashboard
- Add credentials to `.env.local`

## 📁 Project Structure

```
CuraLink/
├── app/                          # Next.js 13 App Router
│   ├── api/                      # API routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── external-data/        # Clinical trials, experts, publications
│   │   ├── gemini/               # AI chatbot endpoints
│   │   └── ...                   
│   ├── auth/                     # Authentication pages
│   ├── dashboard/                # User dashboards
│   │   ├── patient/              # Patient dashboard & features
│   │   └── researcher/           # Researcher dashboard & features
│   └── ...
├── components/                   # Reusable React components
│   ├── AIAssistant.tsx          # AI chatbot component
│   ├── Header.tsx               # Navigation header
│   └── ...
├── db/                          # Database configuration
│   ├── schema.ts                # Drizzle ORM schema
│   ├── migrations/              # Database migrations
│   └── index.ts
├── lib/                         # Utility functions
│   ├── externalData.ts          # External API integrations
│   ├── ai.ts                    # AI/Gemini utilities
│   ├── mail.ts                  # Email utilities
│   └── ...
├── styles/                      # Global styles
└── types/                       # TypeScript type definitions
```

## 🗄️ Database Schema

The platform uses **Drizzle ORM** with PostgreSQL. Main tables:

- **users** - User accounts (patients & researchers)
- **researchers** - Extended researcher profiles with ORCID
- **patients** - Patient medical profiles
- **forums** - Community discussion forums
- **favorites** - Bookmarked trials, publications, experts
- **notifications** - User notifications
- **verification_tokens** - Email verification

## 🌐 External API Integrations

### ClinicalTrials.gov
- Search and filter clinical trials
- No API key required
- Documentation: [ClinicalTrials.gov API](https://clinicaltrials.gov/api/gui)

### PubMed/PubMed Central
- Access medical research publications
- No API key required for basic usage
- Documentation: [NCBI E-utilities](https://www.ncbi.nlm.nih.gov/books/NBK25501/)

### ORCID
- Verify researcher credentials
- Access publication records
- Public API (no auth for public data)
- Documentation: [ORCID API](https://info.orcid.org/documentation/api-tutorials/)

## 🚢 Deployment

### Vercel (Recommended)
1. Push your code to GitHub
2. Connect repository to [Vercel](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy automatically on every push

### Other Platforms
- **Netlify**: Compatible with Next.js
- **Railway**: Includes PostgreSQL hosting
- **DigitalOcean**: Full control with App Platform

### Environment Variables in Production
Make sure to set all required environment variables in your deployment platform:
- `DATABASE_URL`
- `NEXTAUTH_SECRET`
- `NEXTAUTH_URL` (your production URL)
- `GEMINI_API_KEY`
- Email configuration (if using email features)

## 🧪 Testing

```bash
# Run linting
yarn lint

# Type checking
yarn tsc --noEmit
```

## 📚 Documentation

Additional documentation available in the project:
- `ARCHITECTURE_DIAGRAM.md` - System architecture overview
- `IMPLEMENTATION_COMPLETE_DISEASES.md` - Disease coverage features
- `GEMINI_INTEGRATION_COMPLETE.md` - AI integration details
- `ORCID_IMPLEMENTATION.md` - ORCID setup guide
- `EXTERNAL_API_INTEGRATION.md` - External API usage
- `USER_GUIDE_REAL_DATA.md` - User guide with real data examples

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Code Style
- Use TypeScript for all new code
- Follow the existing code structure
- Add comments for complex logic
- Update documentation as needed

## 🔒 Security

- **Never commit** `.env` or `.env.local` files
- API keys are stored securely in environment variables
- User passwords are hashed with bcryptjs
- NextAuth handles authentication securely
- Regular security updates via Dependabot

### Reporting Security Issues
Please report security vulnerabilities to: security@curalink.com

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

**Chandra Sekhar Dutta**
- GitHub: [@Chandra-Sekhar-Dutta](https://github.com/Chandra-Sekhar-Dutta)

## 🙏 Acknowledgments

- [Next.js](https://nextjs.org/) - React framework
- [Google Gemini](https://ai.google.dev/) - AI assistance
- [ClinicalTrials.gov](https://clinicaltrials.gov/) - Clinical trial data
- [ORCID](https://orcid.org/) - Researcher identification
- [Neon](https://neon.tech/) - Serverless PostgreSQL
- [Drizzle ORM](https://orm.drizzle.team/) - TypeScript ORM

## 📞 Support

For support and questions:
- 📧 Email: support@curalink.com
- 💬 GitHub Issues: [Create an issue](https://github.com/Chandra-Sekhar-Dutta/CuraLink/issues)
- 📖 Documentation: Check the `/docs` folder

## 🗺️ Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Integration with more medical databases
- [ ] Telemedicine features
- [ ] Patient data export (HIPAA compliant)
- [ ] AI-powered trial matching algorithm

---

**Made with ❤️ for rare disease patients and researchers**

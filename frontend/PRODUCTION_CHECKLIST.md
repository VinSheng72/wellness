# Production Deployment Checklist

Use this checklist before deploying to production.

## Pre-Deployment

### Security
- [ ] Change all default passwords from seed data
- [ ] Generate strong JWT_SECRET: `openssl rand -base64 32`
- [ ] Use strong MongoDB credentials
- [ ] Enable HTTPS/SSL
- [ ] Configure CORS properly
- [ ] Review and restrict MongoDB network access
- [ ] Enable MongoDB authentication
- [ ] Set secure cookie flags in production
- [ ] Review all environment variables for sensitive data
- [ ] Implement rate limiting on API endpoints
- [ ] Add security headers (helmet.js or similar)

### Environment Variables
- [ ] Set NODE_ENV=production
- [ ] Configure production MONGODB_URI (MongoDB Atlas recommended)
- [ ] Set strong JWT_SECRET
- [ ] Configure NEXT_PUBLIC_API_URL with production domain
- [ ] Set up postal code API credentials (if using)
- [ ] Remove or secure any debug/development variables

### Database
- [ ] Set up MongoDB Atlas cluster (or production MongoDB)
- [ ] Configure database backups
- [ ] Set up database monitoring
- [ ] Create production database users with appropriate permissions
- [ ] Test database connection from production environment
- [ ] Plan data migration strategy (if migrating existing data)
- [ ] **DO NOT** run seed script on production database

### Code
- [ ] Run all tests: `npm test`
- [ ] Build succeeds: `npm run build`
- [ ] No TypeScript errors: `npm run lint`
- [ ] Remove console.log statements
- [ ] Review and remove development-only code
- [ ] Optimize images and assets
- [ ] Enable Next.js production optimizations

### Infrastructure
- [ ] Set up domain name and DNS
- [ ] Configure SSL/TLS certificates
- [ ] Set up CDN (if applicable)
- [ ] Configure load balancer (if applicable)
- [ ] Set up monitoring and alerting
- [ ] Configure log aggregation
- [ ] Set up error tracking (Sentry, etc.)
- [ ] Plan scaling strategy

## Deployment

### Docker Deployment
- [ ] Build Docker image: `docker build -t wellness-event-booking .`
- [ ] Test Docker image locally
- [ ] Push to container registry
- [ ] Deploy to production environment
- [ ] Verify health check endpoint: `/api/health`

### Vercel Deployment
- [ ] Connect repository to Vercel
- [ ] Configure environment variables in Vercel dashboard
- [ ] Set up production domain
- [ ] Deploy to production: `vercel --prod`
- [ ] Verify deployment

### Manual Deployment
- [ ] Set up production server (VPS, EC2, etc.)
- [ ] Install Node.js 18+
- [ ] Clone repository
- [ ] Install dependencies: `npm ci`
- [ ] Set up environment variables
- [ ] Build application: `npm run build`
- [ ] Set up process manager (PM2)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up SSL certificates (Let's Encrypt)
- [ ] Configure firewall

## Post-Deployment

### Verification
- [ ] Application loads successfully
- [ ] Health check endpoint responds: `curl https://your-domain.com/api/health`
- [ ] Login functionality works
- [ ] HR Admin dashboard loads
- [ ] Vendor Admin dashboard loads
- [ ] Event creation works
- [ ] Event approval works
- [ ] Event rejection works
- [ ] Data isolation verified (users only see their data)
- [ ] All API endpoints respond correctly
- [ ] Database queries are performant

### Monitoring
- [ ] Set up uptime monitoring
- [ ] Configure error alerting
- [ ] Set up performance monitoring
- [ ] Monitor database performance
- [ ] Set up log monitoring
- [ ] Configure backup verification
- [ ] Test disaster recovery procedures

### Documentation
- [ ] Document production environment setup
- [ ] Document deployment procedures
- [ ] Create runbook for common issues
- [ ] Document backup and recovery procedures
- [ ] Create user documentation
- [ ] Document API endpoints (if public)

### User Management
- [ ] Create production user accounts
- [ ] Disable or remove seed data accounts
- [ ] Set up user onboarding process
- [ ] Plan password reset functionality
- [ ] Consider implementing 2FA

### Performance
- [ ] Run performance tests
- [ ] Optimize database queries
- [ ] Enable caching where appropriate
- [ ] Optimize bundle size
- [ ] Test under expected load
- [ ] Set up CDN for static assets

### Compliance & Legal
- [ ] Review data privacy requirements
- [ ] Implement GDPR compliance (if applicable)
- [ ] Add privacy policy
- [ ] Add terms of service
- [ ] Review data retention policies
- [ ] Implement audit logging

## Ongoing Maintenance

### Regular Tasks
- [ ] Monitor application health daily
- [ ] Review error logs weekly
- [ ] Check database performance weekly
- [ ] Review security alerts
- [ ] Update dependencies monthly
- [ ] Test backups monthly
- [ ] Review and rotate secrets quarterly
- [ ] Conduct security audits quarterly

### Updates
- [ ] Plan update strategy
- [ ] Test updates in staging environment
- [ ] Schedule maintenance windows
- [ ] Communicate updates to users
- [ ] Have rollback plan ready

## Emergency Contacts

Document key contacts for production issues:

- **DevOps Lead:** [Name/Contact]
- **Database Admin:** [Name/Contact]
- **Security Team:** [Name/Contact]
- **On-Call Engineer:** [Name/Contact]

## Rollback Plan

In case of critical issues:

1. **Immediate Actions:**
   - [ ] Assess severity of issue
   - [ ] Notify team
   - [ ] Check error logs and monitoring

2. **Rollback Steps:**
   - [ ] Revert to previous deployment
   - [ ] Verify rollback successful
   - [ ] Communicate status to stakeholders

3. **Post-Incident:**
   - [ ] Document what went wrong
   - [ ] Create action items to prevent recurrence
   - [ ] Update deployment procedures

## Notes

- Keep this checklist updated as your deployment process evolves
- Customize based on your specific infrastructure and requirements
- Review and update after each deployment
- Share with all team members involved in deployment

---

**Last Updated:** [Date]
**Reviewed By:** [Name]

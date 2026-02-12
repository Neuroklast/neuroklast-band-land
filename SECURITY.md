# Security Policy

Thank you for helping make the NEUROKLAST band website safe and secure.

## Reporting Security Issues

If you believe you have found a security vulnerability in this project, please report it responsibly.

**Please do not report security vulnerabilities through public GitHub issues, discussions, or pull requests.**

Instead, please report security issues by:
1. Creating a private security advisory on GitHub
2. Or by contacting the maintainers directly through the repository

Please include as much of the information listed below as you can to help us better understand and resolve the issue:

* The type of issue (e.g., XSS, CSRF, authentication bypass, data exposure)
* Full paths of source file(s) related to the manifestation of the issue
* The location of the affected source code (tag/branch/commit or direct URL)
* Any special configuration required to reproduce the issue
* Step-by-step instructions to reproduce the issue
* Proof-of-concept or exploit code (if possible)
* Impact of the issue, including how an attacker might exploit the issue

This information will help us triage your report more quickly.

## Supported Versions

We release patches for security vulnerabilities for the latest version of the project. Please ensure you are using the most recent version.

| Version | Supported          |
| ------- | ------------------ |
| Latest  | :white_check_mark: |
| < Latest| :x:                |

## Security Considerations

This is a public-facing band website with the following security features:

- **Admin Authentication**: Password-based authentication for content management
- **Data Validation**: Input validation and sanitization for all user-editable content
- **HTTPS Only**: All production deployments should use HTTPS
- **CSRF Protection**: No state-changing operations via GET requests
- **XSS Prevention**: All user-generated content is properly escaped
- **Dependencies**: Regular dependency updates to patch known vulnerabilities

## Best Practices for Deployment

1. **Environment Variables**: Never commit sensitive API keys or tokens
2. **Admin Password**: Use a strong, unique password for admin access
3. **HTTPS**: Always deploy behind HTTPS
4. **Regular Updates**: Keep dependencies up to date
5. **Rate Limiting**: Consider implementing rate limiting for API endpoints
6. **CSP Headers**: Configure Content Security Policy headers in production

import { NextRequest, NextResponse } from 'next/server';

// Rate limiting (simple in-memory store - use Redis in production)
const rateLimit = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + 60000 }); // 1 minute window
    return true;
  }

  if (limit.count >= 5) {
    return false;
  }

  limit.count++;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    // Get IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 
               request.headers.get('x-real-ip') || 
               'unknown';

    // Check rate limit
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { email } = body;

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // TODO: Choose your email service integration

    // OPTION 1: Resend (Recommended - easiest setup)
    if (process.env.RESEND_API_KEY) {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'FinTrack <noreply@fintrack.com>',
          to: email,
          subject: 'Welcome to FinTrack!',
          html: `
            <h1>Welcome to FinTrack!</h1>
            <p>Thanks for subscribing to our updates.</p>
            <p>We'll keep you informed about new features, tips, and financial insights.</p>
            <a href="https://fintrack-liart.vercel.app/login?mode=signup">Get Started Now</a>
          `,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    }

    // OPTION 2: SendGrid
    if (process.env.SENDGRID_API_KEY) {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${process.env.SENDGRID_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          personalizations: [{ to: [{ email }] }],
          from: { email: 'noreply@fintrack.com', name: 'FinTrack' },
          subject: 'Welcome to FinTrack!',
          content: [
            {
              type: 'text/html',
              value: `
                <h1>Welcome to FinTrack!</h1>
                <p>Thanks for subscribing to our updates.</p>
              `,
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to send email');
      }
    }

    // OPTION 3: Mailchimp
    if (process.env.MAILCHIMP_API_KEY && process.env.MAILCHIMP_LIST_ID) {
      const dc = process.env.MAILCHIMP_API_KEY.split('-')[1];
      const response = await fetch(
        `https://${dc}.api.mailchimp.com/3.0/lists/${process.env.MAILCHIMP_LIST_ID}/members`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.MAILCHIMP_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email_address: email,
            status: 'subscribed',
          }),
        }
      );

      if (!response.ok) {
        const error = await response.json();
        if (error.title === 'Member Exists') {
          return NextResponse.json(
            { message: 'Already subscribed!' },
            { status: 200 }
          );
        }
        throw new Error('Failed to subscribe');
      }
    }

    // OPTION 4: Simple Database Storage (for later processing)
    // Store in your database and process later
    // await db.subscribers.create({ email, subscribedAt: new Date() });

    console.log('📧 Email subscription:', email);

    return NextResponse.json(
      { 
        message: 'Successfully subscribed!',
        email 
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Email subscription error:', error);
    
    return NextResponse.json(
      { error: 'Failed to subscribe. Please try again later.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({ status: 'ok' }, { status: 200 });
}
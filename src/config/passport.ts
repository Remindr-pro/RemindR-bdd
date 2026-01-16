import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import { oauth2Config } from './jwt';
import prisma from './database';
import { UserType } from '@prisma/client';

passport.use(
  new GoogleStrategy(
    {
      clientID: oauth2Config.google.clientId,
      clientSecret: oauth2Config.google.clientSecret,
      callbackURL: oauth2Config.google.redirectUri,
    },
    async (_accessToken, _refreshToken, profile, done) => {
      try {
        if (!profile.emails || !profile.emails[0]) {
          return done(new Error('No email provided by Google'), undefined);
        }

        const email = profile.emails[0].value;
        const firstName = profile.name?.givenName || 'User';
        const lastName = profile.name?.familyName || '';
        const profilePictureUrl = profile.photos?.[0]?.value;

        let user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user) {
          user = await prisma.user.create({
            data: {
              email,
              passwordHash: '', // OAuth users don't have passwords
              firstName,
              lastName,
              dateOfBirth: new Date('1990-01-01'), // Default, should be updated
              userType: UserType.INDIVIDUAL,
              profilePictureUrl,
            },
          });
        } else {
          if (profilePictureUrl && !user.profilePictureUrl) {
            user = await prisma.user.update({
              where: { id: user.id },
              data: { profilePictureUrl },
            });
          }
        }

        return done(null, user);
      } catch (error) {
        return done(error, undefined);
      }
    }
  )
);

passport.serializeUser((user: any, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        userType: true,
        familyId: true,
      },
    });
    done(null, user);
  } catch (error) {
    done(error, undefined);
  }
});

export default passport;


/*
 * Abstract class for a Passport based auth provider.
 */
import * as dbg from 'debug';
import * as express from 'express';
import * as passport from 'passport';
import * as ppcas from 'passport-cas';
import * as pphttp from 'passport-http';

import * as auth from '../shared/auth';

type Request = express.Request;
type RequestHandler = express.RequestHandler;
type Strategy = passport.Strategy;

export type CasProfile = ppcas.Profile;

export type VerifyCallback = (err: any, user?: auth.IUser | false) => void;

export interface BasicProviderOptions {
  realm?: string;
  passReqToCallback?: boolean;
};

export interface CasProviderOptions {
  casUrl: string;
  casServiceUrl: string;
  casAppendPath?: boolean;
  casVersion?: string;
};


const debug = dbg('webapp:passport-auth');

export abstract class PassportAbstractProvider<S extends Strategy> extends auth.AbstractProvider {

  public initialize(): RequestHandler {
    passport.use(this.getStrategy());

    // Warning: Ensure the value of `this` is properly captured.
    passport.serializeUser<{}, string>((user, done) => {
      this.serializeUser(user, done);
    });

    // Warning: Ensure the value of `this` is properly captured.
    passport.deserializeUser<{}, string>((id, done) => {
      this.deserializeUser(id, done);
    });

    const router = express.Router();
    router.use(passport.initialize());
    router.use(passport.session());
    router.use(this.locals());
    return router;
  };

  public authenticate(options?: any): express.RequestHandler {
    return passport.authenticate(this.getStrategy().name || 'undefined', options);
  };

  public logout(req: Request): void {
    req.logout();
  };

  public getUser(req: Request): auth.IUser | undefined {
    return req.user;
  };

  protected abstract getStrategy(): S;

  // Simply serialize the user to JSON string for storage in the session.
  // Override this methods if your application uses a databases, etc.
  protected serializeUser(user: any, done: (err: any, id?: any) => void) {
    try {
      done(null, JSON.stringify(user));
    } catch (err) {
      done(err);
    }
  };

  // Simply deserialize the user from a JSON string from the session.
  // Override this methods if your application uses a databases, etc.
  protected deserializeUser(id: string, done: (err: any, user?: any) => void) {
    try {
      done(null, JSON.parse(String(id)));
    } catch (err) {
      done(err);
    }
  };
};

export abstract class BasicPassportAbstractProvider extends PassportAbstractProvider<pphttp.BasicStrategy> {

  protected strategy: pphttp.BasicStrategy;

  constructor(options: BasicProviderOptions) {
    super();
    if (debug.enabled) {
      debug('Basic Passport options: %s ', JSON.stringify(options));
    }
    this.strategy = new pphttp.BasicStrategy(options, (username, password, done) => {
      this.verify(username, password, done);
    });
  };

  protected getStrategy(): pphttp.BasicStrategy {
    return this.strategy;
  }

  protected abstract verify(username: string, password: string, done: VerifyCallback): void;
};

export abstract class CasPassportAbstractProvider extends PassportAbstractProvider<ppcas.Strategy> {

  protected options: CasProviderOptions;

  protected strategy: ppcas.Strategy;

  constructor(options: CasProviderOptions) {
    super();

    this.options = options;

    if (!options.casUrl) {
      throw new Error('CAS base URL is required');
    }

    if (!options.casServiceUrl) {
      throw new Error('CAS service URL is required');
    }

    // The passport-cas library does not directly support version 'CAS2.0',
    // but it can be used as 'CAS3.0' with special configuration.

    let version: 'CAS1.0' | 'CAS3.0';
    if (options.casVersion === 'CAS2.0' || options.casVersion === 'CAS3.0') {
      version = 'CAS3.0';
    } else {
      options.casVersion = 'CAS1.0';
      version = 'CAS1.0';
    }

    const strategyOptions: ppcas.StrategyOptions = {
      ssoBaseURL: options.casUrl,
      serviceURL: options.casAppendPath ? undefined : options.casServiceUrl,
      serverBaseURL: options.casAppendPath ? options.casServiceUrl : undefined,
      validateURL: options.casVersion === 'CAS2.0' ? '/serviceValidate' : undefined,
      version: version,
    };
    if (debug.enabled) {
      debug('CAS Passport options: %s ', JSON.stringify(strategyOptions));
    }
    this.strategy = new ppcas.Strategy(strategyOptions, (profile, done) => {
      // Warning: Ensure the value of `this` is properly captured.
      // (An arrow function is used here, but this.verify.bind(this) worked too.)
      this.verify(profile, done);
    });
  };

  public getCasLogoutUrl(service?: boolean): string {
    // Redirect to CAS logout. CAS v3 uses 'service' parameter and
    // CAS v2 uses 'url' parameter to allow redirect back to service
    // after logout is complete. The specification does not require
    // the 'gateway' parameter for logout, but RubyCAS needs it to redirect.
    let url = this.options.casUrl + '/logout';
    if (service) {
      if (this.options.casVersion === 'CAS3.0') {
        url += '?service=' + encodeURIComponent(this.options.casServiceUrl);
      } else if (this.options.casVersion === 'CAS2.0') {
        url += '?url=' + encodeURIComponent(this.options.casServiceUrl);
      }
    }
    return url;
  };

  protected getStrategy(): ppcas.Strategy {
    return this.strategy;
  }

  protected abstract verify(profile: string | CasProfile, done: VerifyCallback): void;
};
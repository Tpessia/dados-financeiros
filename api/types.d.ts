declare global {
  namespace NodeJS {
    interface ProcessEnv {
      NODE_ENV: 'dev' | 'prod';
      PORT: string;
      TZ: string;
      GA_MEASUREMENT_ID: string;
      GA_API_SECRET: string;
      GA_CLIENT_ID: string;
    }
  }
}

// If this file has no import/export statements (i.e. is a script)
// convert it into a module by adding an empty export statement.
export {}
declare global {
  namespace NodeJS {
    interface ProcessEnv {
      MONGODB_URI: string
      MONGODB_DB_NAME?: string
      NODE_ENV: 'development' | 'production'
    }
  }
}

export {} 
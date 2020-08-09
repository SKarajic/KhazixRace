export const DotenvConfiguration = {
  envFilePath: process.env.NODE_ENV !== 'production' ? ['.env'] : [],
} as any
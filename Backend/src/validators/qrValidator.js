const { z } = require('./commonSchemas');

const generate = z.object({
  body: z.object({ assetId: z.string().uuid() }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

const verify = z.object({
  body: z.object({
    qrData: z.union([z.string(), z.record(z.any())])
  }),
  query: z.object({}).passthrough(),
  params: z.object({}).passthrough()
});

module.exports = { generate, verify };

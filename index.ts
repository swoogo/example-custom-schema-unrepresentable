import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import z from "zod"

const main = async () => {
  if (!process.env.OPENAI_API_KEY) {
    console.error(`Run this like

  OPENAI_API_KEY=<your-key> npm run start
`)
    return
  }

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    // I'd like to tell the AI SDK that I'm fine with the risk of having
    // unrepresentable types in the JSON schema being cast to `any` rather than
    // throwing an error here.
    schema: z.object({
      customField: z.custom<
        `example-${number}-test`
      >((val) => /^example-\d+-test$/g.test(val as string)),
      // With this field enabled everything works as expected.
      // customField: z.string(),
    }),
    system: 'You are really good at making objects with a custom string in it in the form of `{ customField: \'example-{random number}-test\' }`',
    prompt: 'Make the string for me please.',
    temperature: 1,
  })

  console.log('object', object)
}

main()

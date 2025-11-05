import { openai } from "@ai-sdk/openai"
import { generateObject } from "ai"
import z from "zod"

const schema = z.object({
  customField: z.custom<
    `example-${number}-test`
  >((val) => /^example-\d+-test$/g.test(val as string)),
  // With this field enabled everything works as expected.
  stringField: z.string(),
})

const main = async () => {
  if (!process.env.OPENAI_API_KEY) {
    console.error(`Run this like

  OPENAI_API_KEY=<your-key> npm run start
`)
    return
  }

  try {
    console.log('\nWith unrepresentable as throws (default)', z.toJSONSchema(schema))
  } catch (e) {
    console.error('\nThis error always appears', e)
  }

  try {
    console.log('\nWith unrepresentable as any', z.toJSONSchema(schema, { unrepresentable: 'any' }))
  } catch (e) {
    console.error('\nThis error never appears', e)
  }

  const { object } = await generateObject({
    model: openai('gpt-4o-mini'),
    // I'd like to tell the AI SDK that I'm fine with the risk of having
    // unrepresentable types in the JSON schema being cast to `any` rather than
    // throwing an error here.
    schema,
    system: 'You are really good at making objects with a custom string in it in the form of `{ customField: \'example-{random number}-test\', stringField: \'example-{random number}-test\' }`',
    prompt: 'Make the string for me please.',
    temperature: 1,
  })

  console.log('\nAI Output', object)
}

main()

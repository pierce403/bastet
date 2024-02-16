import time
import interactions
import openai
import os  # To access environment variables
import json

def show_json(obj):
    print(json.loads(obj.model_dump_json()))

# Assuming your OpenAI API key is stored in an environment variable named 'OPENAI_API_KEY'
openai_api_key = os.getenv("OPENAI_API_KEY")
discord_api_key = os.getenv("DISCORD_API_KEY")

# set up an openai client
client = openai.Client(api_key=openai_api_key)
thread = client.beta.threads.create()
show_json(thread)

# set up discord bot
bot = interactions.Client(token=discord_api_key)

async def ask_openai(question):    
#def ask_openai(question):    
    message = client.beta.threads.messages.create(
      thread_id=thread.id,
      role="user",
      content=question,)
    
    show_json(message)
    run = client.beta.threads.runs.create(
        thread_id=thread.id,
        assistant_id='asst_l08J1XKKmjU0B9ffiQP7yeDw',
    )
    show_json(run)
    while run.status == "queued" or run.status == "in_progress":
        run = client.beta.threads.runs.retrieve(
            thread_id=thread.id,
            run_id=run.id,
        )
        print("waiting..")
        time.sleep(0.5)

    # get the latest messages
    messages = client.beta.threads.messages.list(thread_id=thread.id)
    show_json(messages)

    return messages.data[0].content[0].text.value

@bot.command(
    name="ask",
    description="Ask Bastet",
    scope=1204774675511771177,
    options=[
        interactions.Option(
            name="question",
            description="The question you want to ask Bastet",
            type=interactions.OptionType.STRING,
            required=True,
        ),
    ],
)
async def my_openai_command(ctx: interactions.CommandContext, question: str):
    # Make sure we're in the "altar" channel
    # Tell the user that they're in the wrong channel in a way that only they can see it
    if ctx.channel_id != 1204957338608336926:
        await ctx.send("This is not the place for that young one. Visit me at the #altar.")
        return

    # To avoid timeouts, send a "thinking" message first, then edit with response later
    await ctx.send("Thinking...")
    answer = await ask_openai(question)
    await ctx.edit(answer if answer else "Sorry, I couldn't get a response from OpenAI.")

bot.start()

# ask openai a simple question
#print(ask_openai("What is your purpose?"))

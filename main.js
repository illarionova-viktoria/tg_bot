import {Telegraf, Markup} from 'telegraf';
import {message} from "telegraf/filters";
import config from "config";
import {Loader} from "./loader.js";
import {chatGPT} from "./chatgbt.js";




const token = config.get('TELEGRAM_TOKEN') //в идеале создать конфиг, чтобы все это вынести
const webAppUrl = 'https://tg-app-3786c.web.app'

const bot = new Telegraf(token)

bot.command('start', (ctx) => {
    ctx.reply(
        'Добро пожаловать! Приветствую тебя путник в этом телеграм боте.🍀' +
        'Ты можешь нажать на кнопку Open app и провалиться в удивительное mini приложение.⚡️' +
        'Еще ты можешь ввести команду /puk и узнать что будет. А если ты хочешь познать магию, то напиши 3 слова через запятую и я создам историю 🪄🔮',
        Markup.keyboard([
            Markup.button.webApp(
                'Отправить сообщение', webAppUrl + '/feedback')
        ])
    )
})

bot.command('puk',(ctx)=> {
    ctx.reply(
        'Я помогу тебе, что ты хочешь?',
        Markup.inlineKeyboard([
            Markup.button.callback("Посмотреть", "look"),
            Markup.button.callback("Покакать", "poop"),]
        )
    )
})

bot.action("look", (ctx) => {
    // ctx.editMessageReplyMarkup();
    ctx.editMessageText("смотри");
});

bot.action("poop", (ctx) => {
    // ctx.editMessageReplyMarkup();
    ctx.editMessageText("какай");
});

bot.on(message('text'), async (ctx) => {
    try {
        const text = ctx.message.text

        if (!text.trim()) ctx.reply('Текст не может быть пустым')

        const loader = new Loader(ctx)

        await loader.show()

        const response = await chatGPT(text)

        if (!response) return ctx.reply('Ошибка с API', response)

        loader.hide()

        ctx.reply(`Ваша история: ${response.content}`)
    } catch (e) {
        console.log('Error while proccessing text: ', e.message)
    }
})


bot.on(message('web_app_data'), async ctx => {
    const data = ctx.webAppData.data.json();
    ctx.reply(`Ваше сообщение: ${data.feedback}` ?? 'empty message');
})

bot.launch()


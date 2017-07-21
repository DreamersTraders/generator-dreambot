'use strict';
const Generator = require('yeoman-generator');
const chalk = require('chalk');
const parameters = require('./parameters');
const altCurrencies = require('./currencies.js');
const defaultValues = require('./defaultValues.js');
const strategies = require('./strategies.js');

module.exports = class extends Generator {

  constructor(args, opts) {
    super(args, opts);

    // The actions are: init, add
    this.argument('action', {type: String, required: true});

    // Helper function to start a GUNBOT for the given currency index.
    this.startGunbotCurrency = (market, currencies, index) => {
      if (!this.isCurrencyIndexValid(currencies, index)) {
        return;
      }

      let args = [
        'start',
        `./${parameters.gunbotExeName}`,
        '--name',
        `BTC_${currencies[index]}_${market[0].toUpperCase()}`,
        '--',
        `BTC_${currencies[index]}`,
        market];

      // Start GUNBOT
      let spawn = require('child_process').spawn;
      let process = spawn('pm2', args);

      // Print success or error
      process.on('close', code => {
        if (code) {
          this.log(`${chalk.green('YEAH!')} - Iniciando DREAMBOT para BTC_${currencies[index]}. :) use - gmon -r 10  - para ver el monitor. `);

          return;
        }

        this.log(`${chalk.green('YEAH!')} - Iniciando DREAMBOT para BTC_${currencies[index]}. :) use - gmon -r 10  - para ver el monitor `);

        // Start next bot if there are currencies left.
        index++;
        if (!this.isCurrencyIndexValid(currencies, index)) {
          return;
        }
        setTimeout(() => this.startGunbotCurrency(market, currencies, index), parameters.timeoutBetweenGunbotStarts);
      });
    };

    this.isCurrencyIndexValid = (currencies, index) => {
      if (currencies.length < index + 1) {
        return false;
      }

      if (currencies[index] === undefined) {
        return false;
      }

      return true;
    };
  }

  prompting() {
    if (this.options.action === 'init') {
      this.log(chalk.green(' /-----------------------------------------------------------------------------------\\'));
      this.log(`  Tu necesitas tu ${chalk.bold.green('API key')} y ${chalk.bold.green('API secret')} para configurar los archivos de DREAMBOT.`);
      this.log('');
      this.log(`  Presiona ${chalk.bold('CTRL+C')} si tu quieres terminar este proceso.`);
      this.log(`  Ingresa ${chalk.bold('ginit')} si tu quieres reiniciar el proceso.`);
      this.log(chalk.green(' \\-----------------------------------------------------------------------------------/'));
      this.log('');
    }

    const prompts = [
      {
        type: 'list',
        name: 'market',
        message: 'Cual exchange?',
        choices: parameters.markets
      }, {
        when: props => props.market === 'poloniex',
        type: 'input',
        name: 'poloniexApiKey',
        message: '[POLONIEX_KEY] Tu API key Poloniex:',
        store: true
      }, {
        when: props => props.market === 'poloniex',
        type: 'password',
        name: 'poloniexApiSecret',
        message: '[POLONIEX_SECRET] Tu API secret Poloniex:',
        store: true
      }, {
        when: props => props.market === 'bittrex',
        type: 'input',
        name: 'bittrexApiKey',
        message: '[BITTREX_KEY] Your Bittrex API key:',
        store: true
      }, {
        when: props => props.market === 'bittrex',
        type: 'password',
        name: 'bittrexApiSecret',
        message: '[BITTREX_SECRET] Your Bittrex API secret:',
        store: true
      }, {
        when: props => props.market === 'kraken',
        type: 'input',
        name: 'krakenApiKey',
        message: '[KRAKEN_KEY] Your Kraken API key:',
        store: true
      }, {
        when: props => props.market === 'kraken',
        type: 'password',
        name: 'krakenApiSecret',
        message: '[KRAKEN_SECRET] Your Kraken API secret:',
        store: true
      }, {
        when: () => this.options.action === 'init',
        type: 'input',
        name: 'btcTradingLimit',
        message: '[BTC_TRADING_LIMIT] Cantidad máxima de BTC utilizada por cada par BTC/XXX:',
        default: defaultValues.btcTradingLimit,
        store: true
      }, {
        when: () => this.options.action === 'add',
        type: 'input',
        name: 'btcTradingLimit',
        message: '[BTC_TRADING_LIMIT] Cantidad máxima de BTC utilizada por el nuevo par BTC/XXX:',
        default: defaultValues.btcTradingLimit,
        store: true
      },

      // STRATEGY
      // ------------------------
      {
        type: 'list',
        name: 'buyStrategy',
        message: '[BUY_STRATEGY] Cuál estrategía de COMPRA quieres usar?',
        default: defaultValues.buyStrategy,
        choices: strategies,
        store: true
      }, {
        type: 'list',
        name: 'sellStrategy',
        message: '[SELL_STRATEGY] Qué estrategia de VENTA quieres usar?',
        default: defaultValues.buyStrategy,
        choices: strategies,
        store: true
      },

      // BUY SETTINGS
      // ------------------------
      {
        when: props => props.buyStrategy === 'BB',
        type: 'input',
        name: 'bbLow',
        message: '[LOW_BB] en porcentaje. Comprar si el precio es x% o menos por encima de la banda Bollinger más baja:',
        default: defaultValues.bbLow,
        store: true
      }, {
        when: props => props.buyStrategy === 'GAIN',
        type: 'input',
        name: 'gainBuyLevel',
        message: '[BUY_LEVEL] en porcentaje. Comprar si el precio es x% por debajo del valor de ema inferior:',
        default: defaultValues.gainBuyLevel,
        store: true
      }, {
        when: props => props.buyStrategy === 'PINGPONG',
        type: 'input',
        name: 'pingpongBuyPrice',
        message: '[PINGPONG_BUY] Buy price:',
        default: defaultValues.pingpongBuyPrice,
        store: true
      }, {
        when: props => props.buyStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainBuyLevelOne',
        message: '[BUYLVL1] en porcentaje. Comprar cuando el precio cae en x% o menos:',
        default: defaultValues.stepgainBuyLevelOne,
        store: true
      }, {
        when: props => props.buyStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainBuyLevelTwo',
        message: '[BUYLVL2] Por ciento. Comprar cuando el precio cae en x% o menos:',
        default: defaultValues.stepgainBuyLevelTwo,
        store: true
      }, {
        when: props => props.buyStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainBuyLevelThree',
        message: '[BUYLVL3] Por ciento. Comprar cuando el precio cae en x% o menos:',
        default: defaultValues.stepgainBuyLevelThree,
        store: true
      },

      // SELL SETTINGS
      // ------------------------
      {
        when: props => props.sellStrategy === 'BB',
        type: 'input',
        name: 'bbHigh',
        message: '[HIGH_BB] en porcentaje. Vender si el precio es x% o menos debajo de la banda más alta de Bollinger:',
        default: defaultValues.bbHigh,
        store: true
      }, {
        when: props => props.sellStrategy === 'GAIN',
        type: 'input',
        name: 'gainSellLevel',
        message: '[GAIN] en porcentaje. Vender si el precio es x% sobre el precio comprado:',
        default: defaultValues.gainSellLevel,
        store: true
      }, {
        when: props => props.sellStrategy === 'PINGPONG',
        type: 'input',
        name: 'pingpongSellPrice',
        message: '[PINGPONG_SELL] Precio de VENTA:',
        default: defaultValues.pingpongSellPrice,
        store: true
      }, {
        when: props => props.sellStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainSellLevelOne',
        message: '[SELLLVL1] en porcentaje. Vender si el precio es x% sobre el precio comprado:',
        default: defaultValues.stepgainSellLevelOne,
        store: true
      }, {
        when: props => props.sellStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainSellLevelTwo',
        message: '[SELLLVL2] en porcentaje. Vender si el precio es x% sobre el precio comprado:',
        default: defaultValues.stepgainSellLevelTwo,
        store: true
      }, {
        when: props => props.sellStrategy === 'STEPGAIN',
        type: 'input',
        name: 'stepgainSellLevelThree',
        message: '[SELLLVL3] en porcentaje. Vender si el precio es x% sobre el precio comprado:',
        default: defaultValues.stepgainSellLevelThree,
        store: true
      },

      // TIMINGS
      // ------------------------
      {
        type: 'input',
        name: 'botSleepDelay',
        message: '[BOT_SLEEP_DELAY] Retardo del ciclo de bot. Tiempo que el robot duerme entre ciclos:',
        default: defaultValues.botSleepDelay,
        store: true
      }, {
        type: 'input',
        name: 'botOnFailSleepDelay',
        message: '[BOT_ON_FAIL_DELAY] Retardo del ciclo de repetición de bot si el ciclo anterior ha fallado:',
        default: defaultValues.botOnFailSleepDelay,
        store: true
      },

      // CURRENCY/ CURRENCIES
      // ------------------------
      {
        when: () => this.options.action === 'init',
        type: 'checkbox',
        name: 'currencies',
        message: 'Selecciona las monedas que deseas tradear:',
        choices: props => altCurrencies[props.market],
        store: true
      }, {
        when: () => this.options.action === 'init',
        type: 'checkbox',
        name: 'currenciesToStart',
        message: 'Selecciona un par para iniciar ahora mismo:',
        choices: props => props.currencies,
        default: props => props.currencies,
        store: true
      }, {
        when: () => this.options.action === 'add',
        type: 'list',
        name: 'currencyToAdd',
        message: 'Seleciona los pares que quieres agregar a DREAMBOT:',
        choices: props => altCurrencies[props.market]
      }, {
        when: () => this.options.action === 'add',
        type: 'confirm',
        name: 'startCurrencyToAdd',
        message: '¿Deseas que el nuevo par se inicie automáticamente ahora mismo?:',
        default: true,
        store: true
      }];

    return this.prompt(prompts).then(props => {
      this.props = props;
    });
  }

  writing() {
    // INIT action
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (this.options.action === 'init') {
      this.fs.copyTpl(
        this.templatePath('ALLPAIRS-params.js'),
        this.destinationPath('ALLPAIRS-params.js')
      );

      for (let currency of this.props.currencies) {
        // Create empty config files.
        this.fs.copyTpl(
          this.templatePath(`${this.props.market}-BTX_XXX-config.js`),
          this.destinationPath(`${this.props.market}-BTC_${currency}-config.js`),
          {
            poloniexApiKey: this.props.poloniexApiKey || defaultValues.poloniexApiKey,
            poloniexApiSecret: this.props.poloniexApiSecret || defaultValues.poloniexApiSecret,
            bittrexApiKey: this.props.bittrexApiKey || defaultValues.bittrexApiKey,
            bittrexApiSecret: this.props.bittrexApiSecret || defaultValues.bittrexApiSecret,
            krakenApiKey: this.props.krakenApiKey || defaultValues.krakenApiKey,
            krakenApiSecret: this.props.krakenApiSecret || defaultValues.krakenApiSecret,
            btcTradingLimit: this.props.btcTradingLimit || defaultValues.btcTradingLimit,
            buyStrategy: this.props.buyStrategy || defaultValues.buyStrategy,
            sellStrategy: this.props.sellStrategy || defaultValues.sellStrategy,
            bbLow: this.props.bbLow || defaultValues.bbLow,
            bbHigh: this.props.bbHigh || defaultValues.bbHigh,
            gainBuyLevel: this.props.gainBuyLevel || defaultValues.gainBuyLevel,
            gainSellLevel: this.props.gainSellLevel || defaultValues.gainSellLevel,
            pingpongBuyPrice: this.props.pingpongBuyPrice || defaultValues.pingpongBuyPrice,
            pingpongSellPrice: this.props.pingpongSellPrice || defaultValues.pingpongSellPrice,
            stepgainBuyLevelOne: this.props.stepgainBuyLevelOne || defaultValues.stepgainBuyLevelOne,
            stepgainBuyLevelTwo: this.props.stepgainBuyLevelTwo || defaultValues.stepgainBuyLevelTwo,
            stepgainBuyLevelThree: this.props.stepgainBuyLevelThree || defaultValues.stepgainBuyLevelThree,
            stepgainSellLevelOne: this.props.stepgainSellLevelOne || defaultValues.stepgainSellLevelOne,
            stepgainSellLevelTwo: this.props.stepgainSellLevelTwo || defaultValues.stepgainSellLevelTwo,
            stepgainSellLevelThree: this.props.stepgainSellLevelThree || defaultValues.stepgainSellLevelThree,
            botSleepDelay: this.props.botSleepDelay || defaultValues.botSleepDelay,
            botOnFailSleepDelay: this.props.botOnFailSleepDelay || defaultValues.botOnFailSleepDelay
          }
        );
      }
    }

    // ADD action
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (this.options.action === 'add') {
      this.fs.copyTpl(
        this.templatePath(`${this.props.market}-BTX_XXX-config.js`),
        this.destinationPath(`${this.props.market}-BTC_${this.props.currencyToAdd}-config.js`),
        {
          poloniexApiKey: this.props.poloniexApiKey || defaultValues.poloniexApiKey,
          poloniexApiSecret: this.props.poloniexApiSecret || defaultValues.poloniexApiSecret,
          bittrexApiKey: this.props.bittrexApiKey || defaultValues.bittrexApiKey,
          bittrexApiSecret: this.props.bittrexApiSecret || defaultValues.bittrexApiSecret,
          krakenApiKey: this.props.krakenApiKey || defaultValues.krakenApiKey,
          krakenApiSecret: this.props.krakenApiSecret || defaultValues.krakenApiSecret,
          btcTradingLimit: this.props.btcTradingLimit || defaultValues.btcTradingLimit,
          buyStrategy: this.props.buyStrategy || defaultValues.buyStrategy,
          sellStrategy: this.props.sellStrategy || defaultValues.sellStrategy,
          bbLow: this.props.bbLow || defaultValues.bbLow,
          bbHigh: this.props.bbHigh || defaultValues.bbHigh,
          gainBuyLevel: this.props.gainBuyLevel || defaultValues.gainBuyLevel,
          gainSellLevel: this.props.gainSellLevel || defaultValues.gainSellLevel,
          pingpongBuyPrice: this.props.pingpongBuyPrice || defaultValues.pingpongBuyPrice,
          pingpongSellPrice: this.props.pingpongSellPrice || defaultValues.pingpongSellPrice,
          stepgainBuyLevelOne: this.props.stepgainBuyLevelOne || defaultValues.stepgainBuyLevelOne,
          stepgainBuyLevelTwo: this.props.stepgainBuyLevelTwo || defaultValues.stepgainBuyLevelTwo,
          stepgainBuyLevelThree: this.props.stepgainBuyLevelThree || defaultValues.stepgainBuyLevelThree,
          stepgainSellLevelOne: this.props.stepgainSellLevelOne || defaultValues.stepgainSellLevelOne,
          stepgainSellLevelTwo: this.props.stepgainSellLevelTwo || defaultValues.stepgainSellLevelTwo,
          stepgainSellLevelThree: this.props.stepgainSellLevelThree || defaultValues.stepgainSellLevelThree,
          botSleepDelay: this.props.botSleepDelay || defaultValues.botSleepDelay,
          botOnFailSleepDelay: this.props.botOnFailSleepDelay || defaultValues.botOnFailSleepDelay
        }
      );
    }
  }

  install() {
    // INIT action
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (this.options.action === 'init') {
      this.startGunbotCurrency(this.props.market, this.props.currenciesToStart, 0);
    }

    // ADD action
    // ~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
    if (this.options.action === 'add') {
      if (this.props.startCurrencyToAdd) {
        this.startGunbotCurrency(this.props.market, [this.props.currencyToAdd], 0);
      }
    }
  }

};

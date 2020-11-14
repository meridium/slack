import * as github from '@actions/github'
import axios from 'axios'
import MockAdapter from 'axios-mock-adapter'
import send from '../src/slack'
import {readFileSync} from 'fs'

const url = 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXXXXXX'
const jobName = 'Build and Test'
const jobStatus = 'Success'
const jobSteps = {}
const channel = '@override'

// mock github context
const dump = JSON.parse(readFileSync('./__tests__/fixtures/delete.json', 'utf-8'))

github.context.payload = dump.event
github.context.eventName = dump.event_name
github.context.sha = dump.sha
github.context.ref = dump.ref
github.context.workflow = dump.workflow
github.context.action = dump.action
github.context.actor = dump.actor

process.env.CI = 'true'
process.env.GITHUB_WORKFLOW = 'build-test'
process.env.GITHUB_RUN_ID = '110240292'
process.env.GITHUB_RUN_NUMBER = '143'
process.env.GITHUB_ACTION = 'self2'
process.env.GITHUB_ACTIONS = 'true'
process.env.GITHUB_ACTOR = 'satterly'
process.env.GITHUB_REPOSITORY = 'act10ns/slack'
process.env.GITHUB_EVENT_NAME = 'delete'
process.env.GITHUB_EVENT_PATH = '/home/runner/work/_temp/_github_workflow/event.json'
process.env.GITHUB_WORKSPACE = '/home/runner/work/slack/slack'
process.env.GITHUB_SHA = '6730ca0708dcf207e6090d8e721fa80749321ac3'
process.env.GITHUB_REF = 'refs/heads/master'
process.env.GITHUB_HEAD_REF = ''
process.env.GITHUB_BASE_REF = ''
process.env.GITHUB_SERVER_URL = 'https://github.com'
process.env.GITHUB_API_URL = 'https://github.com'
process.env.GITHUB_GRAPHQL_URL = 'https://api.github.com/graphql'


test('delete event to slack', async () => {
  const mockAxios = new MockAdapter(axios, {delayResponse: 200})

  mockAxios
    .onPost()
    .reply(config => {
      console.log(config.data)
      return [200, {status: 'ok'}]
    })
    .onAny()
    .reply(500)

  const res = await send(url, jobName, jobStatus, jobSteps, channel)
  await expect(res).toStrictEqual({text: {status: 'ok'}})

  // expect(mockAxios.history.post[0].data).toBe(
  //   JSON.stringify({
  //     username: 'GitHub Action',
  //     icon_url: 'https://octodex.github.com/images/original.png',
  //     channel: '@override',
  //     attachments: [
  //       {
  //         fallback: '[GitHub]: [act10ns/slack] build-test pull_request Success',
  //         color: 'good',
  //         author_name: 'satterly',
  //         author_link: 'https://github.com/satterly',
  //         author_icon: 'https://avatars0.githubusercontent.com/u/615057?v=4',
  //         mrkdwn_in: ['text'],
  //         text:
  //           '*<https://github.com/act10ns/slack/pull/17/checks|Workflow _build-test_ job _Build and Test_ triggered by _pull_request_ is _Success_>* for <https://github.com/act10ns/slack/pull/17/files|`rename-to-slack`>\n<https://github.com/act10ns/slack/pull/17|`37b5e3e7`> - Rename to slack',
  //         fields: [],
  //         footer: '<https://github.com/act10ns/slack|act10ns/slack>',
  //         footer_icon: 'https://github.githubassets.com/favicon.ico',
  //         ts: '1589446771000'
  //       }
  //     ]
  //   })
  // )

  mockAxios.resetHistory()
  mockAxios.reset()
})
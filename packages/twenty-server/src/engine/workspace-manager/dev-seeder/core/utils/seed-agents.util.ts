import { type QueryRunner } from 'typeorm';

import { AgentChatMessageRole } from 'src/engine/metadata-modules/agent/agent-chat-message.entity';
import {
  SEED_APPLE_WORKSPACE_ID,
  SEED_YCOMBINATOR_WORKSPACE_ID,
} from 'src/engine/workspace-manager/dev-seeder/core/constants/seeder-workspaces.constant';
import { USER_WORKSPACE_DATA_SEED_IDS } from 'src/engine/workspace-manager/dev-seeder/core/utils/seed-user-workspaces.util';

const agentChatThreadTableName = 'agentChatThread';
const agentChatMessageTableName = 'agentChatMessage';
const agentChatMessagePartTableName = 'agentChatMessagePart';

export const AGENT_DATA_SEED_IDS = {
  APPLE_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000001',
  YCOMBINATOR_DEFAULT_AGENT: '20202020-0000-4000-8000-000000000002',
};

export const AGENT_CHAT_THREAD_DATA_SEED_IDS = {
  APPLE_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000011',
  YCOMBINATOR_DEFAULT_THREAD: '20202020-0000-4000-8000-000000000012',
};

export const AGENT_CHAT_MESSAGE_DATA_SEED_IDS = {
  APPLE_MESSAGE_1: '20202020-0000-4000-8000-000000000021',
  APPLE_MESSAGE_2: '20202020-0000-4000-8000-000000000022',
  APPLE_MESSAGE_3: '20202020-0000-4000-8000-000000000023',
  APPLE_MESSAGE_4: '20202020-0000-4000-8000-000000000024',
  YCOMBINATOR_MESSAGE_1: '20202020-0000-4000-8000-000000000031',
  YCOMBINATOR_MESSAGE_2: '20202020-0000-4000-8000-000000000032',
  YCOMBINATOR_MESSAGE_3: '20202020-0000-4000-8000-000000000033',
  YCOMBINATOR_MESSAGE_4: '20202020-0000-4000-8000-000000000034',
};

export const AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS = {
  APPLE_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000041',
  APPLE_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000042',
  APPLE_MESSAGE_3_PART_1: '20202020-0000-4000-8000-000000000043',
  APPLE_MESSAGE_4_PART_1: '20202020-0000-4000-8000-000000000044',
  YCOMBINATOR_MESSAGE_1_PART_1: '20202020-0000-4000-8000-000000000051',
  YCOMBINATOR_MESSAGE_2_PART_1: '20202020-0000-4000-8000-000000000052',
  YCOMBINATOR_MESSAGE_3_PART_1: '20202020-0000-4000-8000-000000000053',
  YCOMBINATOR_MESSAGE_4_PART_1: '20202020-0000-4000-8000-000000000054',
};

type SeedChatThreadsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

const seedChatThreads = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedChatThreadsArgs) => {
  let threadId: string;
  let userWorkspaceId: string;

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    threadId = AGENT_CHAT_THREAD_DATA_SEED_IDS.APPLE_DEFAULT_THREAD;
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM;
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    threadId = AGENT_CHAT_THREAD_DATA_SEED_IDS.YCOMBINATOR_DEFAULT_THREAD;
    userWorkspaceId = USER_WORKSPACE_DATA_SEED_IDS.TIM_ACME;
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat thread seeding: ${workspaceId}`,
    );
  }

  const now = new Date();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatThreadTableName}`, [
      'id',
      'userWorkspaceId',
      'createdAt',
      'updatedAt',
    ])
    .orIgnore()
    .values([
      {
        id: threadId,
        userWorkspaceId,
        createdAt: now,
        updatedAt: now,
      },
    ])
    .execute();

  return threadId;
};

type SeedChatMessagesArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
  threadId: string;
};

const seedChatMessages = async ({
  queryRunner,
  schemaName,
  workspaceId,
  threadId,
}: SeedChatMessagesArgs) => {
  let messageIds: string[];
  let partIds: string[];
  let messages: Array<{
    id: string;
    threadId: string;
    role: AgentChatMessageRole;
    createdAt: Date;
  }>;
  let messageParts: Array<{
    id: string;
    messageId: string;
    orderIndex: number;
    type: string;
    textContent: string;
    createdAt: Date;
  }>;

  const now = new Date();
  const baseTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

  if (workspaceId === SEED_APPLE_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_2,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.APPLE_MESSAGE_4,
    ];
    partIds = [
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_1_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_2_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_3_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.APPLE_MESSAGE_4_PART_1,
    ];
    messages = [
      {
        id: messageIds[0],
        threadId,
        role: AgentChatMessageRole.USER,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
      {
        id: messageIds[2],
        threadId,
        role: AgentChatMessageRole.USER,
        createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
      },
      {
        id: messageIds[3],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Hello! Can you help me understand our current hydraulic cylinder production schedule and key performance metrics?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent:
          "Hello! I'm SIA, and I'd be happy to help you understand Swanson Industries' production schedule and metrics. Based on your workspace data, I can see you have various manufacturing orders and customer accounts tracked. What specific aspect would you like to explore - cylinder production timelines, facility performance metrics, or order fulfillment targets?",
        createdAt: new Date(baseTime.getTime() + 5 * 60 * 1000),
      },
      {
        id: partIds[2],
        messageId: messageIds[2],
        orderIndex: 0,
        type: 'text',
        textContent:
          "I'd like to focus on our facility performance metrics and how production output is trending over the last quarter.",
        createdAt: new Date(baseTime.getTime() + 10 * 60 * 1000),
      },
      {
        id: partIds[3],
        messageId: messageIds[3],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Great! Looking at your facility performance data, I can see several key trends from the last quarter. Overall production output has increased by 15%, with particularly strong performance from our Morgantown facility. Daily cylinder completions are averaging 250 units, and manufacturing efficiency has improved by 8%. Would you like me to dive deeper into any specific facility metrics or create a detailed production report?',
        createdAt: new Date(baseTime.getTime() + 15 * 60 * 1000),
      },
    ];
  } else if (workspaceId === SEED_YCOMBINATOR_WORKSPACE_ID) {
    messageIds = [
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_1,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_2,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_3,
      AGENT_CHAT_MESSAGE_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_4,
    ];
    partIds = [
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_1_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_2_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_3_PART_1,
      AGENT_CHAT_MESSAGE_PART_DATA_SEED_IDS.YCOMBINATOR_MESSAGE_4_PART_1,
    ];
    messages = [
      {
        id: messageIds[0],
        threadId,
        role: AgentChatMessageRole.USER,
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: messageIds[1],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: messageIds[2],
        threadId,
        role: AgentChatMessageRole.USER,
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: messageIds[3],
        threadId,
        role: AgentChatMessageRole.ASSISTANT,
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000),
      },
    ];
    messageParts = [
      {
        id: partIds[0],
        messageId: messageIds[0],
        orderIndex: 0,
        type: 'text',
        textContent:
          'What are our top customer accounts and which facilities are handling the highest order volumes?',
        createdAt: new Date(baseTime.getTime()),
      },
      {
        id: partIds[1],
        messageId: messageIds[1],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Hello! I'm SIA, and I can help you analyze customer accounts and facility performance. From your Swanson Industries workspace data, I can see strong order volumes from mining equipment customers, particularly in the longwall shield refurbishment segment. Several facilities are showing 40%+ increases in monthly production capacity. Would you like me to provide specific facility performance metrics or focus on broader customer trends?',
        createdAt: new Date(baseTime.getTime() + 3 * 60 * 1000),
      },
      {
        id: partIds[2],
        messageId: messageIds[2],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Please focus on our top 5 customer accounts and their order volumes.',
        createdAt: new Date(baseTime.getTime() + 8 * 60 * 1000),
      },
      {
        id: partIds[3],
        messageId: messageIds[3],
        orderIndex: 0,
        type: 'text',
        textContent:
          'Here are your top 5 customer accounts by order volume: 1) Atlas Mining Co. - 45% increase in orders, $2.8M annual, 2) Northern Shield Systems - 38% growth, $2.1M annual, 3) Longwall Equipment Inc. - 35% increase, $3.5M annual, 4) Underground Services Ltd. - 32% growth, $2.4M annual, 5) Mountain Mining Solutions - 28% increase, $2.9M annual. All customers are showing strong repeat order rates (>95%) and expanding their equipment fleets. Would you like detailed breakdowns for any specific customer account?',
        createdAt: new Date(baseTime.getTime() + 12 * 60 * 1000),
      },
    ];
  } else {
    throw new Error(
      `Unsupported workspace ID for agent chat message seeding: ${workspaceId}`,
    );
  }

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatMessageTableName}`, [
      'id',
      'threadId',
      'role',
      'createdAt',
    ])
    .orIgnore()
    .values(messages)
    .execute();

  await queryRunner.manager
    .createQueryBuilder()
    .insert()
    .into(`${schemaName}.${agentChatMessagePartTableName}`, [
      'id',
      'messageId',
      'orderIndex',
      'type',
      'textContent',
      'createdAt',
    ])
    .orIgnore()
    .values(messageParts)
    .execute();
};

type SeedAgentsArgs = {
  queryRunner: QueryRunner;
  schemaName: string;
  workspaceId: string;
};

export const seedAgents = async ({
  queryRunner,
  schemaName,
  workspaceId,
}: SeedAgentsArgs) => {
  const threadId = await seedChatThreads({
    queryRunner,
    schemaName,
    workspaceId,
  });

  await seedChatMessages({
    queryRunner,
    schemaName,
    workspaceId,
    threadId,
  });
};

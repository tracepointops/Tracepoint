import { currentAIChatThreadState } from '@/ai/states/currentAIChatThreadState';
import { mapDBMessagesToUIMessages } from '@/ai/utils/mapDBMessagesToUIMessages';
import { useApolloCoreClient } from '@/object-metadata/hooks/useApolloCoreClient';
import { useRecoilState } from 'recoil';
import { isDefined } from 'twenty-shared/utils';
import {
  useGetChatMessagesQuery,
  useGetChatThreadsQuery,
} from '~/generated-metadata/graphql';

export const useAgentChatData = () => {
  const apolloMetadataClient = useApolloCoreClient();

  const [currentAIChatThread, setCurrentAIChatThread] = useRecoilState(
    currentAIChatThreadState,
  );

  const { loading: threadsLoading } = useGetChatThreadsQuery({
    client: apolloMetadataClient ?? undefined,
    skip: isDefined(currentAIChatThread) || !apolloMetadataClient,
    onCompleted: (data) => {
      if (data.chatThreads.length > 0) {
        setCurrentAIChatThread(data.chatThreads[0].id);
      }
    },
  });

  const { loading: messagesLoading, data } = useGetChatMessagesQuery({
    client: apolloMetadataClient ?? undefined,
    variables: { threadId: currentAIChatThread! },
    skip: !isDefined(currentAIChatThread) || !apolloMetadataClient,
  });

  const uiMessages = mapDBMessagesToUIMessages(data?.chatMessages || []);
  const isLoading = messagesLoading || threadsLoading;

  return {
    uiMessages,
    isLoading,
  };
};

import { Trans } from '@lingui/react';
import { emailTheme } from 'src/common-style';

import { BaseEmail } from 'src/components/BaseEmail';
import { CallToAction } from 'src/components/CallToAction';
import { HighlightedContainer } from 'src/components/HighlightedContainer';
import { HighlightedText } from 'src/components/HighlightedText';
import { Link } from 'src/components/Link';
import { MainText } from 'src/components/MainText';
import { SubTitle } from 'src/components/SubTitle';
import { Title } from 'src/components/Title';
import { capitalize } from 'src/utils/capitalize';
import { createI18nInstance } from 'src/utils/i18n.utils';
import { type APP_LOCALES } from 'twenty-shared/translations';

type SendInviteLinkEmailProps = {
  link: string;
  workspace: { name: string | undefined; logo: string | undefined };
  sender: {
    email: string;
    firstName: string;
    lastName: string;
  };
  serverUrl: string;
  locale: keyof typeof APP_LOCALES;
};

export const SendInviteLinkEmail = ({
  link,
  workspace: _workspace,
  sender,
  serverUrl: _serverUrl,
  locale,
}: SendInviteLinkEmailProps) => {
  const i18n = createI18nInstance(locale);

  const senderName = capitalize(sender.firstName);
  const senderEmail = sender.email;

  return (
    <BaseEmail width={333} locale={locale}>
      <Title value={i18n._('Join your Swanson Team')} />
      <MainText>
        <>
          {i18n._('Join your team on Swansons Operational Dashboard')}
          <br />
          <br />
          <Trans
            id="{senderName} (<0>{senderEmail}</0>) has invited you to join our workspace."
            values={{ senderName, senderEmail }}
            components={{
              0: (
                <Link
                  href={`mailto:${senderEmail}`}
                  value={senderEmail}
                  color={emailTheme.font.colors.blue}
                />
              ),
            }}
          />
          <br />
        </>
      </MainText>
      <HighlightedContainer>
        <HighlightedText value="Swanson Industries Workspace" />
        <CallToAction href={link} value={i18n._('Join Workspace')} />
      </HighlightedContainer>
      <SubTitle value={i18n._('Who is Swanson?')} />
      <MainText>
        {i18n._(
          'Swanson Industries is a leading provider of hydraulic cylinder manufacturing, remanufacturing, repair and distribution services strategically located throughout the United States.',
        )}
      </MainText>
      <CallToAction
        href="https://swansonindustries.com/"
        value={i18n._('Visit')}
      />
    </BaseEmail>
  );
};

SendInviteLinkEmail.PreviewProps = {
  link: 'https://app.twenty.com/invite/123',
  workspace: {
    name: 'Acme Inc.',
    logo: 'https://fakeimg.pl/200x200/?text=ACME&font=lobster',
  },
  sender: { email: 'john.doe@example.com', firstName: 'John', lastName: 'Doe' },
  serverUrl: 'https://app.twenty.com',
  locale: 'en',
} as SendInviteLinkEmailProps;

export default SendInviteLinkEmail;

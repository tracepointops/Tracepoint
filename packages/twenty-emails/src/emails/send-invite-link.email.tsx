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
import tracepointLogoBlue from '../assets/tracepoint-logo-blue.png';
import swansonLogo from '../assets/swanson-logo.png';

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
      <div style={{ textAlign: 'center', marginBottom: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
        <img
          src={swansonLogo}
          alt="Swanson Industries"
          style={{ width: '180px', height: 'auto' }}
        />
        <img
          src={tracepointLogoBlue}
          alt="Tracepoint"
          style={{ width: '160px', height: 'auto' }}
        />
      </div>
      <Title value={i18n._('Join Swanson Industries Team')} />
      <MainText>
        <>
          {i18n._(
            'You have been invited to join your team on Tracepoint - A Swanson Industries Workspace.',
          )}
          <br />
          <br />
          <Trans
            id="{senderName} (<0>{senderEmail}</0>) has invited you to join the Swanson Industries workspace."
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
      <SubTitle value={i18n._('About Swanson Industries')} />
      <MainText>
        {i18n._(
          'Swanson Industries is a leading provider of hydraulic cylinder manufacturing, remanufacturing, repair and distribution services strategically located throughout the United States.',
        )}
      </MainText>
      <CallToAction
        href="https://swansonindustries.com/"
        value={i18n._('Learn More')}
      />
    </BaseEmail>
  );
};

SendInviteLinkEmail.PreviewProps = {
  link: 'https://top.tracepointops.com/invite/123',
  workspace: {
    name: 'Swanson Industries',
    logo: tracepointLogoBlue,
  },
  sender: { email: 'wayne@swanson.com', firstName: 'Wayne', lastName: 'Lytle' },
  serverUrl: 'https://top.tracepointops.com',
  locale: 'en',
} as SendInviteLinkEmailProps;

export default SendInviteLinkEmail;

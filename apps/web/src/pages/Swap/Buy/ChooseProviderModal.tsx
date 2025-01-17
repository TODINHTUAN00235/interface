import GetHelpButton from 'components/Button/GetHelp'
import { AutoColumn } from 'components/Column'
import Modal from 'components/Modal'
import Row, { RowBetween } from 'components/Row'
import { useAccount } from 'hooks/useAccount'
import { useBuyFormContext } from 'pages/Swap/Buy/BuyFormContext'
import { ProviderConnectedView } from 'pages/Swap/Buy/ProviderConnectedView'
import { ProviderConnectionError } from 'pages/Swap/Buy/ProviderConnectionError'
import { ProviderOption } from 'pages/Swap/Buy/ProviderOption'
import { ContentWrapper } from 'pages/Swap/Buy/shared'
import { useState } from 'react'
import { Trans } from 'react-i18next'
import styled from 'styled-components'
import { CloseIcon } from 'theme/components'
import { Text } from 'ui/src'
import { uniswapUrls } from 'uniswap/src/constants/urls'
import { FORQuote, FORServiceProvider } from 'uniswap/src/features/fiatOnRamp/types'
import { logger } from 'utilities/src/logger/logger'

const ProviderListPaddedColumn = styled(AutoColumn)`
  position: relative;
  padding: 16px 24px 24px 24px;
`

interface ChooseProviderModal {
  isOpen: boolean
  closeModal: () => void
}

function ChooseProviderModalContent({ closeModal }: ChooseProviderModal) {
  const { derivedBuyFormInfo, buyFormState } = useBuyFormContext()
  const { quoteCurrency, selectedCountry, inputAmount } = buyFormState
  const { quotes, meldSupportedFiatCurrency } = derivedBuyFormInfo
  const [errorProvider, setErrorProvider] = useState<FORServiceProvider>()
  const [connectedProvider, setConnectedProvider] = useState<FORServiceProvider>()

  const account = useAccount()

  const onClose = () => {
    setErrorProvider(undefined)
    setConnectedProvider(undefined)
    closeModal()
  }

  const quoteCurrencyCode = quoteCurrency.meldCurrencyCode
  const recipientAddress = account.address
  if (!selectedCountry || !quoteCurrencyCode || !meldSupportedFiatCurrency || !recipientAddress) {
    logger.debug('ChooseProviderModal', 'ChooseProviderModalContent', 'Modal opened with invalid state. Closing modal.')
    onClose()
    return null
  }

  if (errorProvider) {
    return (
      <ProviderConnectionError
        onBack={() => setErrorProvider(undefined)}
        closeModal={onClose}
        selectedServiceProvider={errorProvider}
      />
    )
  }

  if (connectedProvider) {
    return <ProviderConnectedView closeModal={onClose} selectedServiceProvider={connectedProvider} />
  }

  return (
    <ProviderListPaddedColumn gap="16px">
      <RowBetween>
        <Row>
          <Text variant="body3">
            <Trans i18nKey="fiatOnRamp.checkoutWith" />
          </Text>
        </Row>
        <Row justify="right" gap="xs">
          <GetHelpButton url={uniswapUrls.helpArticleUrls.fiatOnRampHelp} />
          <CloseIcon data-testid="ChooseProviderModal-close" onClick={onClose} />
        </Row>
      </RowBetween>
      {quotes?.quotes?.map((q: FORQuote) => {
        return (
          <ProviderOption
            key={q.serviceProvider}
            quote={q}
            selectedCountry={selectedCountry}
            quoteCurrencyCode={quoteCurrencyCode}
            inputAmount={inputAmount}
            meldSupportedFiatCurrency={meldSupportedFiatCurrency}
            walletAddress={recipientAddress}
            setConnectedProvider={setConnectedProvider}
            setErrorProvider={setErrorProvider}
          />
        )
      })}
      <Text variant="body3" textAlign="center" color="$neutral2">
        <Trans i18nKey="fiatOnRamp.chooseProvider.description" />
      </Text>
    </ProviderListPaddedColumn>
  )
}

export function ChooseProviderModal(props: ChooseProviderModal) {
  return (
    <Modal isOpen={props.isOpen} onDismiss={props.closeModal}>
      <ContentWrapper>
        <ChooseProviderModalContent {...props} />
      </ContentWrapper>
    </Modal>
  )
}

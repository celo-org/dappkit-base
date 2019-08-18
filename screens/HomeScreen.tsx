import * as WebBrowser from "expo-web-browser";
import React from "react";
import {
  Button,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from "react-native";
import { requestAccountAddress, waitForAccountAuth } from "@celo/dappkit";
import { MonoText } from "../components/StyledText";
import { Linking } from "expo";

import { newKit } from '@celo/contractkit'
import BigNumber from "bignumber.js";



export default class HomeScreen extends React.Component<{}, {
  address: string | undefined,
  phoneNumber: string | undefined,
  isLoadingBalance: boolean,
  cUSDBalance: string | undefined,
}> {

  constructor(props) {
    super(props)

    this.state = {
      address: undefined,
      phoneNumber: undefined,
      isLoadingBalance: false,
      cUSDBalance: undefined,
    }
  }

  convertToContractDecimals(balance: string, decimals: string) {
    return new BigNumber(balance).div(new BigNumber(10).pow(parseInt(decimals, 10))).decimalPlaces(2).toString()
  }

  login = async () => {
    const requestId = 'login'
    const dappName = 'My DappName'
    const callback = Linking.makeUrl('/my/path')
    requestAccountAddress({
      requestId,
      dappName,
      callback
    })

    const dappkitResponse = await waitForAccountAuth(requestId)
    const address = dappkitResponse.address
    this.setState({ address, phoneNumber: dappkitResponse.phoneNumber, isLoadingBalance: true })

    const kit = newKit('https://alfajores-infura.celo-testnet.org')
    kit.defaultAccount = address

    const stableToken = await kit.contracts.getStableToken()

    const [cUSDBalanceBig, cUSDDecimals] = await Promise.all([stableToken.balanceOf(address), stableToken.decimals()])
    const cUSDBalance = this.convertToContractDecimals(cUSDBalanceBig, cUSDDecimals)

    this.setState({ cUSDBalance, isLoadingBalance: false })
  }

  renderLoginState() {
    if (this.state.address !== undefined) {
      return (
      <View>
        <Text style={styles.getStartedText}>You are logged in. Your address is {this.state.address} and your phoneNumber is {this.state.phoneNumber}. {this.renderBalance()}</Text>
      </View>)
    } else {
      return (
      <View>
        <Text style={styles.getStartedText}>Login with the Celo wallet</Text>
        <Button title="Login" onPress={this.login}/>
      </View>)
    }
  }

  renderBalance() {
    if (this.state.isLoadingBalance) {
      return "Loading Balances ..."
    }

    if (this.state.address === undefined) {
      return ""
    }

    return `Your cUSD balance is ${this.state.cUSDBalance}.`
  }

  render() {
    return (
      <View style={styles.container}>
        <ScrollView
          style={styles.container}
          contentContainerStyle={styles.contentContainer}
        >
          <View style={styles.welcomeContainer}>
            <Image
              source={
                __DEV__
                  ? require("../assets/images/robot-dev.png")
                  : require("../assets/images/robot-prod.png")
              }
              style={styles.welcomeImage}
            />
          </View>

          <View style={styles.getStartedContainer}>
          { this.renderLoginState() }
          </View>


          <View style={styles.getStartedContainer}>
            <Text style={styles.getStartedText}>Get started by opening</Text>

            <View
              style={[styles.codeHighlightContainer, styles.homeScreenFilename]}
            >
              <MonoText>screens/HomeScreen.js</MonoText>
            </View>

            <Text style={styles.getStartedText}>
              Change this text and your app will automatically reload.
            </Text>
          </View>

          <View style={styles.helpContainer}>
            <TouchableOpacity onPress={handleHelpPress} style={styles.helpLink}>
              <Text style={styles.helpLinkText}>Login</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <View style={styles.tabBarInfoContainer}>
          <Text style={styles.tabBarInfoText}>
            This is a tab bar. You can edit it in:
          </Text>

          <View
            style={[styles.codeHighlightContainer, styles.navigationFilename]}
          >
            <MonoText style={styles.codeHighlightText}>
              navigation/MainTabNavigator.js
            </MonoText>
          </View>
        </View>
      </View>
    );
  }
}

HomeScreen.navigationOptions = {
  header: null
};

function DevelopmentModeNotice() {
  if (__DEV__) {
    const learnMoreButton = (
      <Text onPress={handleLearnMorePress} style={styles.helpLinkText}>
        Learn more
      </Text>
    );

    return (
      <Text style={styles.developmentModeText}>
        Development mode is enabled: your app will be slower but you can use
        useful development tools. {learnMoreButton}
      </Text>
    );
  } else {
    return (
      <Text style={styles.developmentModeText}>
        You are not in development mode: your app will run at full speed.
      </Text>
    );
  }
}

function handleLearnMorePress() {
  WebBrowser.openBrowserAsync(
    "https://docs.expo.io/versions/latest/workflow/development-mode/"
  );
}

async function handleHelpPress() {
  const web3 = new Web3("https://integration-infura.celo-testnet.org");
  console.log(await web3.eth.getBlock("latest"));
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff"
  },
  developmentModeText: {
    marginBottom: 20,
    color: "rgba(0,0,0,0.4)",
    fontSize: 14,
    lineHeight: 19,
    textAlign: "center"
  },
  contentContainer: {
    paddingTop: 30
  },
  welcomeContainer: {
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20
  },
  welcomeImage: {
    width: 100,
    height: 80,
    resizeMode: "contain",
    marginTop: 3,
    marginLeft: -10
  },
  getStartedContainer: {
    alignItems: "center",
    marginHorizontal: 50
  },
  homeScreenFilename: {
    marginVertical: 7
  },
  codeHighlightText: {
    color: "rgba(96,100,109, 0.8)"
  },
  codeHighlightContainer: {
    backgroundColor: "rgba(0,0,0,0.05)",
    borderRadius: 3,
    paddingHorizontal: 4
  },
  getStartedText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    lineHeight: 24,
    textAlign: "center"
  },
  tabBarInfoContainer: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    ...Platform.select({
      ios: {
        shadowColor: "black",
        shadowOffset: { width: 0, height: -3 },
        shadowOpacity: 0.1,
        shadowRadius: 3
      },
      android: {
        elevation: 20
      }
    }),
    alignItems: "center",
    backgroundColor: "#fbfbfb",
    paddingVertical: 20
  },
  tabBarInfoText: {
    fontSize: 17,
    color: "rgba(96,100,109, 1)",
    textAlign: "center"
  },
  navigationFilename: {
    marginTop: 5
  },
  helpContainer: {
    marginTop: 15,
    alignItems: "center"
  },
  helpLink: {
    paddingVertical: 15
  },
  helpLinkText: {
    fontSize: 14,
    color: "#2e78b7"
  }
});

import { DateTime } from "luxon";
import { getAngularService } from "../angular-react-helper";
import { getConfig } from "../config/dynamicConfig";

export const INTRO_DONE_KEY = 'intro_done';

// route = WELCOME if no config present
// route = SUMMARY if config present, but not consented and summary not done
// route = CONSENT if config present, but not consented and summary done
// route = SAVE_QR if config present, consented, but save qr not done
// route = SURVEY if config present, consented and save qr done
// route = DONE if onboarding is finished (intro_done marked)
export enum OnboardingRoute { WELCOME, SUMMARY, CONSENT, SAVE_QR, SURVEY, DONE };
export type OnboardingState = {
  opcode: string,
  route: OnboardingRoute,
}

export let summaryDone = false;
export const setSummaryDone = (b) => summaryDone = b;

export let saveQrDone = false;
export const setSaveQrDone = (b) => saveQrDone = b;

export let registerUserDone = false;
export const setRegisterUserDone = (b) => registerUserDone = b;

export function getPendingOnboardingState(): Promise<OnboardingState> {
  return Promise.all([getConfig(), readConsented(), readIntroDone()]).then(([config, isConsented, isIntroDone]) => {
    let route: OnboardingRoute;
    if (isIntroDone) {
      route = OnboardingRoute.DONE;
    } else if (!config) {
      route = OnboardingRoute.WELCOME;
    } else if (!isConsented && !summaryDone) {
      route = OnboardingRoute.SUMMARY;
    } else if (!isConsented) {
      route = OnboardingRoute.CONSENT;
    } else if (!saveQrDone) {
      route = OnboardingRoute.SAVE_QR;
    } else {
      route = OnboardingRoute.SURVEY;
    }
    return { route, opcode: config?.joined?.opcode };
  });
};

async function readConsented() {
  const StartPrefs = getAngularService('StartPrefs');
  return StartPrefs.readConsentState().then(StartPrefs.isConsented) as Promise<boolean>;
}

async function readIntroDone() {
  const KVStore = getAngularService('KVStore');
  return KVStore.get(INTRO_DONE_KEY).then((read_val) => !!read_val) as Promise<boolean>;
}

export async function markIntroDone() {
  const currDateTime = DateTime.now().toISO();
  const KVStore = getAngularService('KVStore');
  return KVStore.set(INTRO_DONE_KEY, currDateTime);
}

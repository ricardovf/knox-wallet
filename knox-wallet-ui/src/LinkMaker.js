export function linkToAccount(account) {
  return `/account/${account.getIdentifier ? account.getIdentifier() : ''}`;
}

export function linkToSend(account) {
  return `/account/${
    account.getIdentifier ? account.getIdentifier() : ''
  }/send`;
}

export function linkToReceive(account) {
  return `/account/${
    account.getIdentifier ? account.getIdentifier() : ''
  }/receive`;
}

export function linkToAccounts() {
  return `/accounts`;
}

export function linkToSettings() {
  return `/settings`;
}

import { fakeData } from "./fakeData";

export const contactsNoMatchingFilter = fakeData.Clients.reduce<{
  email: string;
  username: string;
  filter: string;
}>(
  (prev, client) => {
    if (client.username.length > prev.username.length) {
      prev.username = client.username;
    }
    if (client.email.length > prev.email.length) {
      prev.email = client.email;
    }
    return prev;
  },
  {
    email: '',
    username: '',
    get filter() {
      let longer: string;
      if (this.email.length > this.username.length) {
        longer = this.email;
      } else {
        longer = this.username;
      }
      return `${longer}m`;
    },
  },
).filter;

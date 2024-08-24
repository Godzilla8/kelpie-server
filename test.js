const ShortUId = require("short-unique-id");

const createReferralId = new ShortUId({ length: 10 });
const referralId = createReferralId.rnd();

console.log(referralId);

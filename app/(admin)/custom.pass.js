const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash('aqwxszed', salt);
console.log(hashedPassword);
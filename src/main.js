// @ts-nocheck
import * as dotenv from 'dotenv';
dotenv.config();

import cron from 'node-cron';
import fetch from 'node-fetch';

// Setup Courier client
import { CourierClient } from '@trycourier/courier';
const courier = CourierClient({ authorizationToken: process.env.COURIER_API_KEY });

async function get_photo_of_the_day() {
  try {
    const url = 'https://api.nasa.gov/planetary/apod?' + new URLSearchParams({ api_key: process.env.NASA_API_KEY });
    const response = await fetch(url);
    const data = await response.json();
    return data;
  } catch (e) {
    console.error(e);
  }

  return null;
}

async function send_email(email, data) {
  try {
    const { requestId } = await courier.send({
      message: {
        to: {
          email,
        },
        template: 'VDQBBT5XTP4ZQQJM8WB0GWC8ZQ64',
        data,
      },
    });
  } catch (e) {
    console.error(e);
  }
}

async function task() {
  const email = process.argv[2];
  const photo_of_the_day = await get_photo_of_the_day();
  await send_email(email, photo_of_the_day);

  console.log(`EMAIL SENT! TO: ${email} -- NASA Image of the Day\n\n`);
}

async function main() {
  if (process.argv.length == 3) {
    const email = process.argv[2];
    task(email);

    cron.schedule('0 0 * * *', task, {
      timezone: 'America/Los_Angeles',
    });
  } else {
    console.error('Email not entered');
  }
}

main();

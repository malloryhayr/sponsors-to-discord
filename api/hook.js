const fetch = require('node-fetch');

async function sendInfo(url, name, avatar, message) {
	await fetch(url, {
		method: 'POST',
		body: `{
            "username": "GitHub Sponsors",
            "avatar_url": "https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png",
            "content": null,
            "embeds": [
              {
                "description": "${message}",
                "color": 1448738,
                "author": {
                  "name": "${name}",
                  "icon_url": "${avatar}"
                }
              }
            ],
            "attachments": []
          }`,
		headers: { 'Content-Type': 'application/json' },
	});
}

function formatMoney(cents) {
	return `\$${(cents / 100).toFixed(2)}`;
}

export default async function handler(req, res) {
	const body = req.body;
	const sponsor = body.sponsorship.sponsor;
	const { url } = req.query;

	if (!url) return res.status(400).send('Missing url param');

	if (body.zen) {
		await sendInfo(
			url,
			'ping',
			'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
			body.zen
		);
		return res.status(200).send('Pong!');
	}

	switch (body.action) {
		case 'created': {
			await sendInfo(
				url,
				sponsor.login,
				sponsor.avatar_url,
				`Began sponsoring at ${formatMoney(
					body.sponsorship.tier.monthly_price_in_cents
				)} (${body.sponsorship.tier.description})`
			);
			break;
		}
		case 'cancelled': {
			await sendInfo(
				url,
				sponsor.login,
				sponsor.avatar_url,
				`Cancelled their sponsorship for ${formatMoney(
					body.sponsorship.tier.monthly_price_in_cents
				)} (${body.sponsorship.tier.description})`
			);
			break;
		}
		case 'edited': {
			await sendInfo(
				url,
				sponsor.login,
				sponsor.avatar_url,
				`Edited their sponsorship to ${formatMoney(
					body.sponsorship.tier.monthly_price_in_cents
				)} (${body.sponsorship.tier.description})`
			);
			break;
		}
		case 'tier_changed': {
			await sendInfo(
				url,
				sponsor.login,
				sponsor.avatar_url,
				`Changed their sponsorship to ${formatMoney(
					body.sponsorship.tier.monthly_price_in_cents
				)} (${body.sponsorship.tier.description}) from ${formatMoney(
					body.changes.tier.from.monthly_price_in_cents
				)} (${body.changes.tier.from.description})`
			);
			break;
		}
		default: {
			break;
		}
	}
	return res.status(200).send('Webhook sent');
}

import fetch from 'node-fetch';

function sendInfo(url, name, avatar, message) {
	fetch(url, {
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
	});
}

function formatMoney(cents) {
	return `\$${(cents / 100).toFixed(2)}`;
}

export default function handler(req, res) {
	const body = req.body;
	const sponsor = body.sponsorship.sponsor;
	const { url } = req.query;

	if (!url) return res.status(400);

	if (body.zen) {
		sendInfo(
			url,
			'ping',
			'https://github.githubassets.com/images/modules/logos_page/GitHub-Mark.png',
			body.zen
		);
		return res.status(200);
	}

	res.status(200);
	switch (body.action) {
		case 'created': {
			sendInfo(
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
			sendInfo(
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
			sendInfo(
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
			sendInfo(
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
}

#!/user/bin/env deno run --allow-net

import { Application } from 'https://deno.land/x/oak@v11.1.0/mod.ts';

const app = new Application();

function sendInfo(url: string, name: string, avatar: string, message: string) {
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

function formatMoney(cents: number): string {
	return `\$${(cents / 100).toFixed(2)}`;
}

app.use(async ctx => {
	const body = await ctx.request.body().value;
	const sponsor = body.sponsorship.sponsor;
	const url = ctx.request.url.searchParams.get('url');

	if (!url) return (ctx.response.status = 400);

	switch (body.action) {
		case 'created': {
			ctx.response.status = 200;
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
			ctx.response.status = 200;
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
			ctx.response.status = 200;
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
			ctx.response.status = 200;
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
			ctx.response.status = 200;
			break;
		}
	}
});

export default app.handle;

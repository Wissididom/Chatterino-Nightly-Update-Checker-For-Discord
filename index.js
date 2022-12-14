require('dotenv').config();
const xml2js = require('xml2js');
const fs = require('fs');
const { WebhookClient } = require('discord.js');
const changelogLink = 'https://github.com/Chatterino/chatterino2/blob/master/CHANGELOG.md';
const nightlyLink = 'https://github.com/Chatterino/chatterino2/releases/tag/nightly-build';
const nightlyOsxLink = 'https://github.com/Chatterino/chatterino2/releases/download/nightly-build/chatterino-osx.dmg';
const nightlyWinLink = 'https://github.com/Chatterino/chatterino2/releases/download/nightly-build/chatterino-windows-x86-64.zip';
const nightlyAppImageLink = 'https://github.com/Chatterino/chatterino2/releases/download/nightly-build/Chatterino-x86_64.AppImage';
const nightlyDebLink = 'https://github.com/Chatterino/chatterino2/releases/download/nightly-build/Chatterino-x86_64.deb';
fetch('https://github.com/Chatterino/chatterino2/releases.atom').then(res => res.text()).then(text => {
	return xml2js.parseStringPromise(text);
}).then(xmlObj => {
	let xmlEntries = xmlObj['feed']['entry'];
	for (let xmlEntry of xmlEntries) {
		if (xmlEntry['title'][0] == 'Nightly Release') {
			let date = new Date();
			date.setDate(date.getDate() - 1);
			let updated = xmlEntry['updated'][0];
			let updatedDate = new Date(updated);
			let timestamp = Math.floor(updatedDate.getTime() / 1000);
			//let differenceSeconds = (new Date() - updatedDate) / 1000;
			//let differenceMinutes = differenceSeconds / 60;
			//let differenceHours = differenceMinutes / 60;
			//console.log(`${differenceSeconds} / 60 = ${differenceMinutes} / 60 = ${differenceHours}`);
			fs.readFile('lastUpdatedValue', async (err, data) => {
				if (!data || data.toString().trim() != updated.trim()) {
					console.log('There is a new version!');
					let latestCommit = await fetch('https://github.com/Chatterino/chatterino2/commits/master.atom').then(res => res.text()).then(text => {
						return xml2js.parseStringPromise(text);
					}).then(xmlCommitObj => {
						return xmlCommitObj['feed']['entry'][0];
					}).catch(err => console.error(err));
					let webhookClient = new WebhookClient({ url: process.env.DISCORD_WEBHOOK_URL});
					webhookClient.send({
						username: 'Chatterino Nightly',
						avatarURL: 'https://camo.githubusercontent.com/6ca305d42786c9dbd0b76f5ade013601b080d71a598e881b4349dff2eafae6c7/68747470733a2f2f666f757274662e636f6d2f696d672f63686174746572696e6f2d69636f6e2d36342e706e67',
						content: `New Nightly Version (Updated: <t:${timestamp}>):\nLatest Commit Message: \`\`${latestCommit['title'][0].trim()}\`\` by \`\`${latestCommit['author'][0]['name'][0].trim()}\`\`\nChangelog: <${changelogLink}>\nLink: <${nightlyLink}>\nOSX: <${nightlyOsxLink}>\nWindows: <${nightlyWinLink}>\nAppImage: <${nightlyAppImageLink}>\nDebian: <${nightlyDebLink}>`
					}).catch(err => console.error(err));
				} else {
					console.log('Already latest version!');
				}
				fs.writeFile('lastUpdatedValue', updated, err => {
					if (err) throw err;
					console.log('Saved lastUpdatedValue!');
				});
			});
		}
	}
}).catch(err => console.error(err));

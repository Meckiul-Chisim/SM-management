# YouTube upload: one-time setup

Haven can upload a post's video to **your own** YouTube channel straight from your browser. There is no server and no secret to hide: you create a free Google "client ID" once, paste it into Settings, and sign in with Google when you upload.

> These steps follow Google's console as it is described at the time of writing. Google moves buttons around from time to time, so names may differ slightly.

## 1. Create a Google Cloud project
1. Open <https://console.cloud.google.com/> and sign in with the Google account that owns your YouTube channel.
2. Create a new project (for example "Haven uploads").

## 2. Turn on the YouTube API
1. Go to **APIs & Services → Library**.
2. Search for **YouTube Data API v3** and press **Enable**.

## 3. Set up the consent screen
1. Go to **APIs & Services → OAuth consent screen** (also called "Google Auth Platform").
2. Choose **External** and fill in the app name (for example "Haven") and your email.
3. Add the scope `https://www.googleapis.com/auth/youtube.upload`.
4. While the app is in **Testing** mode, add your own Google account under **Test users**. Only test users can sign in.

## 4. Create the client ID
1. Go to **APIs & Services → Credentials → Create credentials → OAuth client ID**.
2. Application type: **Web application**.
3. Under **Authorized JavaScript origins**, add every address you open Haven from, with no path and no trailing slash, for example:
   - `http://localhost:5173` (local development)
   - `https://your-haven-site.vercel.app` (your deployed site)
4. Create it and copy the **Client ID** (it ends with `.apps.googleusercontent.com`). You do **not** need the client secret; never paste it anywhere.

## 5. Connect it in Haven
Choose one of these two ways (the second one wins if you use both):

- **In the project (recommended for your own deployment):** copy `.env.example` to `.env`, set `VITE_GOOGLE_CLIENT_ID=your-id`, and restart `npm run dev`. On Vercel add the same name under **Project Settings → Environment Variables** and redeploy. It then works on every address with no per-browser setup. The `.env` file is ignored by git. Only put public values in it: anything starting with `VITE_` is visible to anyone who opens your site.
- **In the app:** open **Settings → YouTube uploads**, paste the client ID and press **Save connection**. It is saved in that browser only.

Then:

1.  Check **Settings → YouTube uploads** says Connected.
2. In **Content studio**, create a post with platform **YouTube** and attach a video file.
3. Press **Upload to YouTube**, choose who can watch it (the default is private), answer the "made for kids" question, tick the confirmation and upload. A Google sign-in window opens the first time.

## Things to know
- **Videos may be locked private.** Google restricts uploads from API projects that have not passed its compliance audit: they can be locked as private. You can still change the video to public in YouTube Studio, or apply for the audit with Google.
- **Daily limit.** Every Google project has a daily quota (10,000 units by default). An upload costs a large share of it, so expect only a handful of uploads per day. Check the Quotas page in the console for the current numbers.
- **Test users.** Until you publish and verify the consent screen, only the accounts you list as test users can sign in.
- **Privacy.** The video, title and text go directly from your browser to Google. Haven stores only the public client ID (in the build or this browser) and your attached files (in this browser). No token is saved: Google signs you in for each upload.
- **Large files.** Keep the tab open until the upload finishes. If the connection drops, start the upload again.

## If something goes wrong
| Message in Haven | What to check |
| --- | --- |
| Google refused the upload | The YouTube Data API is enabled, and your account is a test user. |
| Sign-in window shows an origin error | The address in your browser is listed under Authorized JavaScript origins. |
| No YouTube channel | Create a channel at youtube.com with this Google account. |
| Daily limit used up | Wait until tomorrow (Pacific Time) or ask Google for more quota. |

## What is not built yet
Instagram publishing. It needs a small server (Instagram only publishes from a public link, and its token must be kept secret). That is the planned next step.

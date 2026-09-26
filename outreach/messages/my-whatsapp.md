# Malaysia: WhatsApp messages (English, Bahasa Malaysia, 中文)

Each message maps to a scenario in [docs/11-sales-playbook.md](../../docs/11-sales-playbook.md).

**Variables** come from the lead record and `audit.json`:
- `{{name}}` is the owner's first name, or "boss" / "tauke" / "老板" when unknown.
- `{{biz}}` business name
- `{{r0}}` → `{{r1}}` reviews today → in 90 days
- `{{link}}` audit page
- `{{pay}}` checkout link
- `{{price}}` monthly price
- `{{me}}` founder's first name

**WhatsApp templates:** messages sent first by us (M1, M2, M7, M8, M11) must be pre-approved WhatsApp **Marketing** templates. M1 and M7 carry an image header. Replies inside 24 hours of the owner writing to us can be free text.

---

## M1: visual after "send it" (image: Visual 5)

**EN**
> Hi {{name}}, this is Kit from Mapkeeper, as promised. Left: {{biz}} on Google today. Right: your profile after 90 days with us, around {{r1}} reviews, real photos, every review answered.
> Full plan: {{link}}
> {{price}}/month, no contract, you stay the owner. Reply YES and we start this week.

**BM**
> Hai {{name}}, Kit dari Mapkeeper, seperti dijanjikan. Kiri: {{biz}} di Google hari ini. Kanan: profil anda selepas 90 hari bersama kami, kira-kira {{r1}} ulasan, foto sebenar, setiap ulasan dibalas.
> Pelan penuh: {{link}}
> {{price}}/bulan, tiada kontrak, anda kekal pemilik. Balas YA dan kami mula minggu ini.

**中文**
> {{name}}您好，我是 Mapkeeper 的 Kit，如约发给您。左边是 {{biz}} 今天在 Google 上的样子，右边是与我们合作 90 天后：约 {{r1}} 条评价、真实照片、每条评价都有回复。
> 完整方案：{{link}}
> 每月 {{price}}，无合约，您永远是拥有者。回复「好」，我们本周就开始。

## M2: +24h, "did it come through?"

**EN**
> Hi {{name}}, did the picture come through? The first thing we'd fix is {{finding_1}}. Takes us a week.

**BM**
> Hai {{name}}, gambar tu sampai tak? Perkara pertama kami betulkan: {{finding_1}}. Siap dalam seminggu.

**中文**
> {{name}}您好，图片收到了吗？我们第一件要修的是：{{finding_1}}。一周内完成。

## M3: price question

**EN**
> {{price}}/month. Setup (normally RM390) is free right now. Includes: full profile fix, weekly posts, new photos monthly, replies to every review within 48h, a review stand for your counter, and a monthly report. Cancel anytime, 14-day money back.

**BM**
> {{price}}/bulan. Caj pemasangan (biasanya RM390) percuma sekarang. Termasuk: profil dibaiki sepenuhnya, hantaran setiap minggu, foto baharu setiap bulan, balas setiap ulasan dalam 48 jam, stand ulasan untuk kaunter, dan laporan bulanan. Batal bila-bila masa, wang dikembalikan dalam 14 hari.

**中文**
> 每月 {{price}}。开通费（原价 RM390）目前免费。包括：全面优化资料、每周发布动态、每月新照片、48 小时内回复每条评价、柜台评价立牌，以及每月报告。随时取消，14 天内不满意全额退款。

## M4: "looks good", ask for the start

**EN**
> Great. Want us to start this week? Here's the link (card or online banking): {{pay}}

**BM**
> Bagus. Nak kami mula minggu ini? Ini pautannya (kad atau perbankan dalam talian): {{pay}}

**中文**
> 太好了。要我们本周开始吗？付款链接（信用卡或网上银行）：{{pay}}

## M5: checkout link sent during the call

**EN**
> Here's the link we talked about, {{name}}: {{pay}}. Once it's done, I'll send a 1-minute guide to add us on Google.

**BM**
> Ini pautan yang kita bincang tadi, {{name}}: {{pay}}. Selepas selesai, saya hantar panduan 1 minit untuk tambah kami di Google.

**中文**
> {{name}}，这是刚才说的链接：{{pay}}。完成后我会发一份 1 分钟指南，教您在 Google 上添加我们。

## M6: "later"

**EN**
> No problem. I'll check in on {{date}}. The plan stays here: {{link}}

**BM**
> Tiada masalah. Saya hubungi semula pada {{date}}. Pelan ada di sini: {{link}}

**中文**
> 没问题，我 {{date}} 再联系您。方案在这里：{{link}}

## M7: day 7 nudge (image: Visual 9 or review growth)

**EN**
> {{name}}, quick one: {{competitor}} has {{c_reviews}} reviews, {{biz}} has {{r0}}. Most of the gap is just asking. Our stand and follow-up messages get you to around {{r1}} in 90 days. Start this week?

**BM**
> {{name}}, ringkas saja: {{competitor}} ada {{c_reviews}} ulasan, {{biz}} ada {{r0}}. Kebanyakan jurang itu sebab pelanggan tak diminta. Stand dan mesej susulan kami bawa anda ke kira-kira {{r1}} dalam 90 hari. Mula minggu ini?

**中文**
> {{name}}，简单说一下：{{competitor}} 有 {{c_reviews}} 条评价，{{biz}} 只有 {{r0}} 条。差距主要是没有请顾客留评。我们的立牌和跟进讯息能在 90 天内帮您达到约 {{r1}} 条。本周开始吗？

## M8: close the file

**EN**
> I'll close your file for now, {{name}}. If you want it later, just reply here. All the best to {{biz}}!

**BM**
> Saya tutup fail anda buat masa ini, {{name}}. Kalau perlukan nanti, balas saja di sini. Semoga maju jaya {{biz}}!

**中文**
> {{name}}，我先把您的档案关闭。之后需要的话，直接在这里回复就可以。祝 {{biz}} 生意兴隆！

## M9: welcome after payment

**EN**
> Welcome to Mapkeeper, {{name}}! 3 quick things:
> 1) This 5-minute form: {{form}}
> 2) Add us on Google (1-minute guide): {{guide}}
> 3) Send 10 photos of your shop and food here.
> Your new profile goes live within 7 days.

**BM**
> Selamat datang ke Mapkeeper, {{name}}! 3 perkara ringkas:
> 1) Borang 5 minit ini: {{form}}
> 2) Tambah kami di Google (panduan 1 minit): {{guide}}
> 3) Hantar 10 foto kedai dan makanan anda di sini.
> Profil baharu anda siap dalam 7 hari.

**中文**
> 欢迎加入 Mapkeeper，{{name}}！3 件小事：
> 1）填写这份 5 分钟表格：{{form}}
> 2）在 Google 上添加我们（1 分钟指南）：{{guide}}
> 3）在这里发 10 张店面和食物的照片。
> 新资料将在 7 天内上线。

## M10: day 7, "you're live" (image: real before/after)

**EN**
> Done! This is {{biz}} on Google now, next to where we started. Your review stand arrives this week. From here, we post weekly and answer every review.

**BM**
> Siap! Ini {{biz}} di Google sekarang, berbanding permulaan kita. Stand ulasan sampai minggu ini. Selepas ini, kami buat hantaran setiap minggu dan balas setiap ulasan.

**中文**
> 完成了！这是 {{biz}} 现在在 Google 上的样子，和刚开始时对比。评价立牌本周送到。之后我们每周发布动态，并回复每条评价。

## M11: payment reminder

**EN**
> Hi {{name}}, the link is still open if you'd like to start: {{pay}}. Anything I can answer?

**BM**
> Hai {{name}}, pautan masih dibuka jika nak mula: {{pay}}. Ada apa-apa soalan?

**中文**
> {{name}}您好，付款链接仍然有效：{{pay}}。有什么问题我可以解答吗？

---

## Operations messages (clients)

### O1: negative review approval

**EN**
> New 2★ review on {{biz}}: "{{excerpt}}". Our draft reply: "{{draft}}". Reply OK to post, or send your changes.

**BM**
> Ulasan 2★ baharu untuk {{biz}}: "{{excerpt}}". Draf balasan kami: "{{draft}}". Balas OK untuk hantar, atau hantar perubahan anda.

**中文**
> {{biz}} 收到一条 2★ 新评价：「{{excerpt}}」。我们的回复草稿：「{{draft}}」。回复 OK 即发布，或发送您的修改。

### O2: monthly photos

**EN**
> Photo time! Send 8 photos from this month: new dishes, the team, the shop busy. We'll pick the best.

**BM**
> Masa untuk foto! Hantar 8 foto bulan ini: menu baharu, pasukan, kedai sedang sibuk. Kami pilih yang terbaik.

**中文**
> 该拍照啦！发 8 张这个月的照片：新菜、团队、店里热闹的样子。我们挑最好的。

### O3: monthly report

**EN**
> {{month}} report for {{biz}}: {{calls}} calls and {{directions}} direction requests from Google, {{new_reviews}} new reviews (rating {{rating}}). Full report: {{report}}

**BM**
> Laporan {{month}} untuk {{biz}}: {{calls}} panggilan dan {{directions}} permintaan arah dari Google, {{new_reviews}} ulasan baharu (penilaian {{rating}}). Laporan penuh: {{report}}

**中文**
> {{biz}} {{month}} 报告：来自 Google 的 {{calls}} 通来电、{{directions}} 次导航，{{new_reviews}} 条新评价（评分 {{rating}}）。完整报告：{{report}}

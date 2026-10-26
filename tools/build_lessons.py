#!/usr/bin/env python3
"""Generates the lesson pages from the content below. Run from the repo root: python3 tools/build_lessons.py"""
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent

NAV = [("scan.html", "Scanner"), ("inventory.html", "Inventory"), ("lessons.html", "Lessons")]

TEMPLATE = """<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>{title}</title>
<meta name="description" content="{desc}">
<link rel="stylesheet" href="style.css">
</head>
<body>
<header class="site"><div class="in">
<a class="home" href="index.html">Flea Market Jam</a>
{nav}
</div></header>
<div class="stripe"></div>
<main>
<p class="muted"><a href="lessons.html">All lessons</a></p>
<h1>{title}</h1>
{body}
<div class="row noprint" style="margin-top:28px">{prev}{next}</div>
</main>
<footer>Fees, policies and laws change. Where this page says to check, open the linked official page before you act. This is general information, not legal or tax advice.</footer>
</body>
</html>
"""

CHECK = '<div class="note"><strong>Check before you rely on this.</strong> {}</div>'

PAGES = []

def page(slug, title, desc, body):
    PAGES.append((slug, title, desc, body))

page("start-here", "Start Here: How Reselling Works",
     "The basic loop of finding, identifying, pricing, photographing, listing and shipping.",
"""
<p>Every sale follows the same loop. The scanner on this site helps with steps 2 and 3, and the lessons cover the rest.</p>
<ol>
<li><strong>Find.</strong> Estate sales, thrift stores, yard sales and your own closets. Buy only what you can sell for at least twice what you paid, after fees.</li>
<li><strong>Identify.</strong> What is it, who made it, how old is it, and is it real? Look for marks first.</li>
<li><strong>Price.</strong> Look at what the same item actually sold for, not what people are asking.</li>
<li><strong>Photograph.</strong> Good photos sell items. See <a href="photos-and-pricing.html">Photos and Pricing</a>.</li>
<li><strong>List.</strong> Pick the platform that fits the item. See the eBay, Etsy and Marketplace lessons.</li>
<li><strong>Ship or hand off.</strong> Pack fragile things well, or sell locally and skip shipping. See <a href="shipping-and-safety.html">Shipping and Safety</a>.</li>
<li><strong>Learn.</strong> Write down what sold, how fast and for how much. That record is how you get better.</li>
</ol>
<h2>Which platform for which item</h2>
<div class="scroll"><table>
<tr><th>Item</th><th>Usually best</th><th>Why</th></tr>
<tr><td>Cobalt glass, rare or higher value</td><td>eBay</td><td>Collectors search nationally and you can see sold prices.</td></tr>
<tr><td>Cobalt glass, common pieces</td><td>Marketplace, local pickup</td><td>Shipping and breakage can cost more than the profit.</td></tr>
<tr><td>Jewelry over about 50 dollars</td><td>eBay or Etsy</td><td>Wider audience. Etsy suits vintage-style pieces.</td></tr>
<tr><td>Costume jewelry, low value</td><td>Marketplace or bundles</td><td>Fees take a big share of small sales.</td></tr>
<tr><td>Small antiques and decor</td><td>eBay or Etsy</td><td>Etsy buyers look for vintage and gift items.</td></tr>
<tr><td>Furniture and heavy items</td><td>Marketplace, local pickup</td><td>No fees and no freight.</td></tr>
</table></div>
<p class="muted">This table is practical advice from common reseller experience, not a platform rule.</p>
<h2>Do not list the same item everywhere at once</h2>
<p>If it sells on one site and is still listed on another, you must cancel a sale or refund an angry buyer. Until you have a system to delist, list each item in one place.</p>
""")

page("photos-and-pricing", "Photos and Pricing",
     "How to photograph items and set a price using sold listings.",
"""
<h2>Photos</h2>
<ul>
<li>Use daylight from a window, or a lightbox. Turn the flash off to avoid glare.</li>
<li>Use a plain background. A white sheet shows the true color of cobalt glass. A dark background shows shape and clarity.</li>
<li>Take the full item first, then every mark, the base, any flaw, and a shot with a ruler or coin for scale.</li>
<li>For jewelry, take close-ups of each stamp and the clasp. Hold the camera steady and tap to focus.</li>
<li>Keep your house out of the frame. Photos you publish on this site are public.</li>
</ul>
<h2>Pricing from sold listings</h2>
<ol>
<li>Search for the item on eBay with its maker, pattern and form.</li>
<li>Filter to <strong>Sold items</strong>. Asking prices do not matter. Sold prices do.</li>
<li>Match condition and details. A chipped piece is not a comparison for a perfect one.</li>
<li>Throw out the highest and lowest prices.</li>
<li>Take the typical price. To sell faster, price a little under it.</li>
<li>Write down your comparisons so you can explain the price later.</li>
</ol>
<p>eBay Seller Hub has a Research tab (called Product Research) with several years of sold data. See <a href="https://www.ebay.com/help/selling/selling-tools/terapeak-research-and-SEO?id=4853">eBay's page on it</a>.</p>
<h2>Adding fees to your price</h2>
<p>Work backward from what you want to keep. If you want to net 50 dollars on eBay in a typical category, fees take roughly 14 percent, so list near 59 dollars before shipping. On Marketplace local pickup, fees are zero, but buyers haggle, so leave 10 to 20 percent of room.</p>
<h2>Using the scanner price</h2>
<p>The scanner gives a range, a quick-sale price and a confidence level. It is an AI estimate from general knowledge, not live sales data. Use the search phrase and the links it gives you to check the range yourself every time.</p>
""")

page("ebay", "Selling on eBay in the US",
     "Fees, limits, listing, research and returns for a new eBay seller.",
"""
<h2>Fees</h2>
<p>These come from eBay's fee page for a seller without a store. Open it to confirm, since eBay changes rates and shows different pages in different cases: <a href="https://www.ebay.com/help/selling/fees-credits-invoices/selling-fees?id=4822">eBay selling fees</a>.</p>
<div class="scroll"><table>
<tr><th>Category</th><th>Final value fee</th></tr>
<tr><td>Most categories, including Pottery and Glass and Antiques</td><td>13.6 percent up to 7,500 dollars per item, then 2.35 percent on the rest</td></tr>
<tr><td>Jewelry and Watches</td><td>15 percent up to 5,000 dollars per item, then 9 percent on the rest</td></tr>
</table></div>
<ul>
<li>Per-order fee: 0.30 dollars for orders of 10 dollars or less, 0.40 dollars above that.</li>
<li>The first 250 listings each month are free, then 0.35 dollars each.</li>
<li>The fee applies to the total sale amount, which can include shipping and tax. Check the fee page for how it applies to you.</li>
</ul>
<p>Example, not a quote: a 100 dollar glass item costs about 14 dollars in fees, so you keep about 86 dollars before shipping and your cost.</p>
<h2>New seller limits</h2>
<p>New accounts usually have a limit on how many items and how many dollars you can sell each month. Reports put a typical start around 10 items and 500 dollars, but it varies by account. Good sales and on-time shipping let you ask for a higher limit after a few weeks. Check your own limit in Seller Hub.</p>
<h2>Writing a listing</h2>
<ul>
<li>Title: up to 80 characters. Lead with the words a buyer would search: maker, item type, color, pattern, size.</li>
<li>Choose the exact category and fill in every item specific.</li>
<li>Use all your photo slots.</li>
<li>Be literal about condition. List chips, cracks, scratches, cloudiness and repairs. Give measurements and weight.</li>
<li>Use the words antique, vintage and reproduction correctly. Call something antique only if you have evidence it is 100 years or older.</li>
<li>For jewelry, say what the stamp says and whether you tested the metal. Say "untested" if you did not.</li>
</ul>
<h2>Returns and the buyer guarantee</h2>
<p>Even if you choose no returns, eBay's Money Back Guarantee can force a refund when an item is not as described or arrives damaged, and you may pay return shipping. Accurate descriptions and careful packing are your protection.</p>
<h2>Authenticity Guarantee</h2>
<p>eBay authenticates some jewelry and watches above a price threshold before they reach the buyer. Thresholds and categories change, so check eBay's current Authenticity Guarantee page when you list higher-value pieces.</p>
<h2>Handling time</h2>
<p>Ship within one to three business days and upload tracking right away. Short handling time helps buyers trust you.</p>
""")

page("etsy", "Selling on Etsy",
     "Etsy fees, the vintage rule, listing limits and what not to list.",
"""
""" + CHECK.format("I could not open Etsy's own help pages while researching this, so the numbers below come from seller guides and blogs. Read Etsy's fee and policy pages in a browser before you open a shop: <a href=\"https://help.etsy.com/hc/en-us/articles/115015628347\">fees</a>, <a href=\"https://www.etsy.com/legal/prohibited/\">prohibited items</a>, <a href=\"https://www.etsy.com/legal/handmade/\">creativity standards</a>.") + """
<h2>Fees as reported</h2>
<ul>
<li>Listing fee: 0.20 dollars per listing.</li>
<li>Transaction fee: 6.5 percent of the order total, including shipping.</li>
<li>Payment processing in the US: 3 percent plus 0.25 dollars.</li>
<li>Offsite Ads: 15 percent of a sale that comes through the ad for shops under 10,000 dollars in yearly sales, and 12 percent above that, with a cap per order. You pay it only when an ad leads to a sale.</li>
</ul>
<h2>The vintage rule</h2>
<p>Etsy treats an item as vintage when it is at least 20 years old at the time you list it. Etsy has no separate antique category. Use the "when made" field, and put the era in the title and description. Say how you dated it, such as a maker's mark, a pattern name or a patent number. Use "circa" when you are unsure.</p>
<p>Etsy is for handmade, vintage and craft supplies. Do not list new mass-produced goods as vintage or handmade.</p>
<h2>Listing limits</h2>
<ul>
<li>Title up to 140 characters.</li>
<li>13 tags, each up to 20 characters. Use phrases a buyer would search.</li>
<li>Up to 20 photos and one short video. Larger photos zoom better.</li>
<li>Fill in every attribute that applies, such as color and material.</li>
</ul>
<h2>What not to list</h2>
<ul>
<li>Ivory, bone, tortoiseshell and similar animal products, even if old. Etsy aims to be free of these.</li>
<li>Radioactive material appears on Etsy's prohibited list. Uranium glass is a gray area, so check the policy text or avoid it as a beginner.</li>
<li>Do not claim glass is food-safe.</li>
</ul>
<h2>Shipping and protection</h2>
<p>You set a processing time and a return policy for each listing. Buy tracked shipping. Etsy's Purchase Protection for Sellers covers qualifying orders up to a set amount when you meet its tracking and delivery rules. Read the current rules on Etsy before you rely on them.</p>
<h2>Payouts</h2>
<p>Etsy pays out to your bank account on a schedule you choose. New shops often wait a few days for funds to become available.</p>
<h2>Why listings are made by hand</h2>
<p>Etsy has a developer program that can create listings, but it needs an approved app and a separate setup. The scanner here gives you drafts to paste instead.</p>
""")

page("marketplace", "Selling on Facebook Marketplace",
     "Fees, shipping, payout timing, scams and safe local meetups.",
"""
""" + CHECK.format("Facebook's help pages could not be read while researching this. Fees came from a seller guide, so confirm them in the app before you list.") + """
<h2>Fees as reported</h2>
<ul>
<li>Local sale where the buyer pays you directly: no selling fee.</li>
<li>Shipped sale paid through Facebook checkout: 10 percent of the item price plus shipping and tax, with a minimum fee of 0.80 dollars.</li>
<li>A chargeback can cost a fee plus the item value. Keep proof of delivery and tracking.</li>
</ul>
<h2>Shipping and payout</h2>
<ul>
<li>For shipped sales you buy your own label and enter tracking.</li>
<li>Payout starts about 5 days after delivery is confirmed, or 15 days after you mark it shipped, whichever comes first, plus a few days to reach the bank. You need a valid tracking number and a connected bank account.</li>
</ul>
<h2>Best uses</h2>
<p>Marketplace works best for furniture, heavy items and common glass, sold locally with cash and no shipping. Leave room in the price for haggling.</p>
<h2>Meeting a buyer safely</h2>
<ul>
<li>Meet in a public place, such as the lobby of a bank or police station. Bring a friend and tell someone where you are going.</li>
<li>For furniture, put it by the door or in the driveway. Do not let strangers into your home.</li>
<li>Keep messages inside the app.</li>
<li>Take cash, or confirm the money in your own payment app before you hand the item over.</li>
</ul>
<h2>Scams to know</h2>
<ul>
<li><strong>Overpayment.</strong> A buyer says they paid too much and asks you to send back the difference. The original payment is fake.</li>
<li><strong>Fake payment screenshots.</strong> Only trust money you can see in your own account.</li>
<li><strong>Code requests.</strong> A buyer says they sent you a code and asks you to read it back. They are trying to take over an account using your phone number. Never share a code.</li>
<li><strong>Payment links and deposits.</strong> Gift cards, Zelle deposits or "friends and family" payments to hold an item. End the deal.</li>
<li><strong>Cashier's checks for too much.</strong> The check bounces days later.</li>
<li><strong>Shipper pickups.</strong> A buyer who says their shipper will collect it and asks for your details or a fee first.</li>
</ul>
<p>Meta lists its own safety advice here: <a href="https://www.meta.com/safety/scam-prevention/marketplace-safety/">Marketplace safety</a>.</p>
<h2>What you cannot list</h2>
<p>Weapons and ammunition, animals, drugs, tobacco, currency and recalled products are off limits. Antiques and jewelry are generally allowed. Do not list ivory, tortoiseshell or antique firearms. Read Facebook's commerce policies.</p>
<h2>Why listings are made by hand</h2>
<p>Facebook has no listing tool for individual sellers. Use the scanner drafts and paste them into the app.</p>
""")

page("cobalt-glass", "Identifying Cobalt Blue Glass",
     "How to tell cobalt glass from other blue glass and from reproductions.",
"""
<h2>What it is</h2>
<p>Cobalt glass is deep blue colored with cobalt oxide. It can look almost black where it is thick and show clear blue against light. Lighter blues, such as aqua and turquoise, come from other colorants. Do not call every blue piece cobalt in a listing.</p>
<h2>Makers and marks</h2>
<ul>
<li><strong>Anchor Hocking.</strong> The mark is an anchor over the letter H.</li>
<li><strong>Hazel-Atlas.</strong> The mark is usually the letter H over the letter A. Look at the whole mark, since it is easy to confuse with the Anchor Hocking mark.</li>
<li><strong>Fire-King.</strong> Ovenware from the 1940s on, often marked Fire-King. Its blue is usually a lighter shade called Sapphire, not true cobalt.</li>
<li><strong>Fenton, Cambridge, Blenko.</strong> Many pieces carry no mark, or only a paper label that has fallen off. Check each maker against its collector club or a museum page before you name it.</li>
</ul>
<p class="muted">Mark meanings change by era. Match any mark you find against a trusted reference before you put a maker in a listing.</p>
<h2>Old or reproduction</h2>
<ul>
<li><strong>Mold seams.</strong> A thin ridge shows the piece was made in a mold. Pressed glass often has seams up the sides and across the base. Corning Museum of Glass explains them in its <a href="https://allaboutglass.cmog.org/definition/seam-mark">glass dictionary</a>.</li>
<li><strong>Pontil mark.</strong> A rough scar on the base where the piece was broken off the rod. It means the piece was blown. It does not prove age, since modern art glass has them too.</li>
<li><strong>Weight and color.</strong> Compare with a piece you know is old. Reproductions are often lighter, thinner and too even in color.</li>
<li><strong>Wear.</strong> Age shows as fine scratches on the base from sliding and small nicks on the rim. Even, perfect wear in odd places is a warning sign.</li>
<li><strong>Sharp mold detail on a piece sold as old</strong> is a warning sign.</li>
</ul>
<h2>Photos to take</h2>
<p>The whole base straight on, every mark in angled light, the seams, the rim, any chips or cloudy patches, and a close-up of the pattern.</p>
<h2>The UV light test</h2>
<p>Uranium glass glows a bright neon green under UV light and usually looks yellow or green in normal light. Glass with manganese glows a weaker yellow-green. Cobalt blue glass is not uranium glass, so do not expect a green glow from it. Never look into a UV light, and use UV-blocking glasses. See the <a href="https://www.orau.org/blog/museum/a-glowing-review-of-uranium-glass.html">Oak Ridge museum page on uranium glass</a>.</p>
""" + CHECK.format("Check current health and radiation guidance before you handle or sell uranium glass. Do not eat or drink from suspect pieces, and do not grind or sand glass. Older glassware can also contain lead, so do not claim a piece is food-safe."))

page("jewelry", "Identifying Jewelry",
     "Hallmarks, tests, costume versus fine jewelry and what to photograph.",
"""
<h2>Common stamps</h2>
<div class="scroll"><table>
<tr><th>Stamp</th><th>Usually means</th></tr>
<tr><td>925 or STERLING</td><td>Silver, 92.5 percent pure</td></tr>
<tr><td>10K, 14K, 18K</td><td>Solid gold, by parts out of 24</td></tr>
<tr><td>585 and 750</td><td>European gold marks, about 14K and 18K</td></tr>
<tr><td>PLAT or 950</td><td>Platinum</td></tr>
<tr><td>GF, RGP, GP, HGE</td><td>Gold filled, rolled gold plate, gold plate, heavy gold electroplate. These are not solid gold.</td></tr>
</table></div>
<p>A stamp is a claim, not proof. A stamp can be fake, and a photo cannot confirm what the metal is. Describe what the piece says, and say whether you tested it.</p>
<h2>Rules on describing metal</h2>
<p>The Federal Trade Commission has rules for how you can describe gold, silver and platinum, and for terms such as gold filled and gold plated. Read them before you list: <a href="https://www.ecfr.gov/current/title-16/chapter-I/subchapter-B/part-23">16 CFR Part 23</a>. The safe habit is to repeat what the mark says and never claim more purity than it states.</p>
<h2>How to test</h2>
<ul>
<li><strong>Magnet.</strong> Gold, silver and platinum are not magnetic. If a strong magnet grabs it, it is not those metals. If it does not, the piece could still be plated or base metal.</li>
<li><strong>Acid kits.</strong> They scratch the surface, so test a hidden spot, and never on a collectible piece.</li>
<li><strong>XRF machine.</strong> A jeweler or pawn shop can read the metal without damage. This is the best check for a valuable piece.</li>
<li><strong>Plating wear.</strong> Brassy color on high points means plating.</li>
</ul>
<h2>Costume jewelry that sells</h2>
<p>Marked pieces from makers such as Trifari, Coro, Miriam Haskell, Eisenberg and Weiss are collectible. Marked pieces can sell from tens of dollars into the hundreds, and rare ones for more. Check sold listings for the exact piece, since prices vary widely. Some makers did not sign early pieces.</p>
<h2>Stones</h2>
<p>A clear stone can be a natural diamond, a lab-grown diamond or a lookalike, and you cannot tell by eye. If you cannot test it, do not call it a diamond. Write "clear stone, untested."</p>
<h2>Photos to take</h2>
<p>Every stamp in a close-up with good light, the clasp, the back of each stone setting, the full piece, a ruler for scale, and any damage.</p>
""")

page("antiques", "Identifying Antiques",
     "Age clues, furniture styles, what to research and what not to refinish.",
"""
<h2>Age clues</h2>
<p>One clue is not a date. Put several together to get a range.</p>
<ul>
<li><strong>Dovetails.</strong> Hand-cut dovetails have uneven spacing and small layout marks, and the tails are often about twice as wide as the pins. Machine-cut dovetails are even and uniform. Machine cutting spread in the late 1800s, so hand-cut joints suggest earlier work but do not prove it.</li>
<li><strong>Saw marks.</strong> Straight, uneven marks suggest an early saw. Curved arcs suggest a circular saw, which came in during the 1800s.</li>
<li><strong>Screws and hardware.</strong> Uneven threads and off-center slots suggest hand-made screws. Even threads and pointed tips are later.</li>
<li><strong>Finish and wear.</strong> Wear should fall where a piece was used, such as feet, arms and drawer edges. A uniform shiny finish may be recent.</li>
<li><strong>Style alone is not a date.</strong> A style can be reproduced many times. A design from 1760 could be built in 1900 or 1980.</li>
</ul>
<h2>Furniture style names</h2>
<ul>
<li><strong>Victorian.</strong> Roughly 1837 to 1901. Heavy, ornate and carved.</li>
<li><strong>Renaissance Revival.</strong> About the 1850s to 1880s. Architectural shapes, carving and panels.</li>
<li><strong>Mission and Arts and Crafts.</strong> About 1900 to the 1920s. Plain, straight, often oak.</li>
<li><strong>Art Deco.</strong> About the 1920s to 1940s. Geometric and streamlined.</li>
</ul>
<p class="muted">These are loose labels. Treat any date as a range and say "attributed" or "circa" when unsure.</p>
<h2>Pottery</h2>
<p>American makers such as Roseville, Hull, McCoy and Weller are collected, and lookalikes and fakes exist. Photograph the base, any mark, and any numbers. Match them to the maker's collector club or a trusted mark guide before you name the maker.</p>
<h2>Silver plate or sterling</h2>
<p>Sterling is marked sterling or 925. Plated pieces are often marked EPNS, plate or quadruple plate, and may show copper or brass where worn. Test before you decide, and do not scrub tarnish off an unknown piece first.</p>
<h2>Research the maker and the price</h2>
<ol>
<li>Search the exact mark plus the type of item.</li>
<li>Check museum collections and collector clubs.</li>
<li>Value from sold prices, not asking prices. See <a href="photos-and-pricing.html">Photos and Pricing</a>.</li>
<li>Match condition. Cracks, repairs and missing parts change the price.</li>
<li>Keep a note of your comparison for each item.</li>
</ol>
<h2>What not to refinish</h2>
<ul>
<li>Do not strip, repaint or heavily sand the original finish on period furniture. The original surface is part of the value.</li>
<li>Do not polish unknown metals, grind glass or scrub pottery glaze.</li>
<li>When unsure, sell as found and describe the condition honestly. Dust it gently and leave it.</li>
</ul>
<h2>Bulky items</h2>
<p>A carved oak bench or chest is heavy. List it on Marketplace for local pickup, measure it, and photograph the joints, the carving and the underside.</p>
""")

page("rules", "Rules: What You Cannot Sell or Claim",
     "Antique versus vintage, ivory, tortoiseshell, feathers, Native American items and firearms.",
"""
""" + '<div class="warn"><strong>Penalties for these can be serious.</strong> When an item might be covered, do not list it until you have checked the current federal and state rules, or pass it to a licensed dealer or auction house.</div>' + """
<h2>Antique and vintage</h2>
<p>By common convention, antique means 100 years or older and vintage means at least about 20 years old. These are trade conventions. Etsy defines vintage as 20 years or older. The 100-year mark also matters in law for some protected materials. Do not write antique unless you have evidence of the age.</p>
<h2>Ivory</h2>
<ul>
<li>Federal law sharply limits selling elephant ivory and other protected ivory. An antique exemption exists, but it has several conditions, including an age of at least 100 years, no repair or change with the material after 1973, and, for some items, entry through a designated port.</li>
<li>State laws can be stricter, and a number of states restrict ivory sales.</li>
<li>Etsy and other sites restrict ivory listings even when an item is old.</li>
<li>Carved pieces, piano keys and scrimshaw are common sources of trouble. Unless you have documents and have checked the rules, do not list them. Bone, resin and celluloid are often mistaken for ivory.</li>
</ul>
<p>See the U.S. Fish and Wildlife Service pages on ivory, and a summary of its antique rules on <a href="https://itsartlaw.org/2019/12/05/restrictions-on-ivory-in-the-united-states-u-s-fish-and-wildlife-service-directors-order-no-210/">ITSArtLaw</a>.</p>
<h2>Tortoiseshell</h2>
<p>Hawksbill turtle shell is protected internationally, and selling it is restricted. Combs, boxes and eyeglass frames sold as tortoiseshell are high risk. Much of what is called tortoiseshell is plastic or celluloid. If you cannot tell, do not call it real tortoiseshell.</p>
<h2>Feathers</h2>
<p>Federal law bars selling eagle feathers and parts whatever their age. Most native wild bird feathers are also protected. Leave feathers out of your listings. See an example enforcement case on <a href="https://www.fws.gov/story/2007-10/michigan-antique-dealer-sentenced-selling-eagle-feathers">the Fish and Wildlife Service site</a>.</p>
<h2>Native American items</h2>
<p>The Indian Arts and Crafts Act is a truth-in-advertising law. It prohibits misrepresenting a product as Native American-made, or as made by a particular tribe. Only call an item Native American if you have documents showing it. Avoid wording such as "Navajo style" on pieces you cannot verify. See the <a href="https://www.fws.gov/law/indian-arts-and-crafts-act">Fish and Wildlife Service page</a>.</p>
<h2>Firearms and ammunition</h2>
<p>Federal law treats guns made in or before 1898 as antique firearms, and generally does not regulate them like modern guns. States can differ, and most selling sites do not allow firearm listings at all. Do not list guns, ammunition or parts. Take them to a licensed dealer or auction house. See the <a href="https://atf.gov/node/29516">ATF page on antique firearms</a>.</p>
<h2>Glass with uranium or lead</h2>
<p>Tell buyers if a piece is uranium glass, and do not sell glass of unknown type as food-safe. Some sites have rules on radioactive material. Read the site's policy first.</p>
""")

page("shipping-and-safety", "Shipping Glass and Staying Safe",
     "Packing fragile items, handling damage claims, and avoiding scams.",
"""
<h2>Packing glass and china</h2>
<ul>
<li>Wrap each piece alone in bubble wrap.</li>
<li>Use a box with at least two inches of cushioning on every side, and suspend the item so it does not touch the walls.</li>
<li>For valuable pieces, use a box inside a second box.</li>
<li>Label the box fragile, but do not count on the label.</li>
<li>Take a photo of the packed box and keep your receipt and tracking.</li>
<li>Insure higher-value pieces.</li>
</ul>
<p class="muted">This is common reseller practice, not a carrier or platform rule.</p>
<h2>When it arrives broken</h2>
<p>On eBay, an item that arrives damaged is returned at the seller's expense with a refund. Ask the buyer for photos of the damage and the packaging, and file with the carrier if you insured it. Good packing and insurance are cheaper than refunds.</p>
<h2>What to ship, and what to sell local</h2>
<p>Ship small, light, valuable pieces. Sell large, heavy, fragile or low-value pieces locally and skip the shipping. Furniture is almost always a local sale.</p>
<h2>Scams</h2>
<p>See the list on the <a href="marketplace.html">Marketplace lesson</a>. The rule that covers all of them: only trust money you can see in your own account, keep talking inside the app, and never share a code a stranger asks for.</p>
<h2>Your address</h2>
<p>Do not post your address. Meet buyers in public. When you publish photos on this site, check that mail, family photos and street views are out of the frame.</p>
""")

ORDER = ["start-here", "photos-and-pricing", "ebay", "etsy", "marketplace", "cobalt-glass", "jewelry", "antiques", "rules", "shipping-and-safety"]

def nav_html():
    return "\n".join(f'<a href="{h}">{t}</a>' for h, t in NAV)

def main():
    by = {s: (t, d, b) for s, t, d, b in PAGES}
    assert set(by) == set(ORDER), set(by) ^ set(ORDER)
    for i, slug in enumerate(ORDER):
        title, desc, body = by[slug]
        prev = f'<a class="btn" href="{ORDER[i-1]}.html">Previous: {by[ORDER[i-1]][0]}</a>' if i else ""
        nxt = f'<a class="btn" href="{ORDER[i+1]}.html">Next: {by[ORDER[i+1]][0]}</a>' if i < len(ORDER) - 1 else ""
        (ROOT / f"{slug}.html").write_text(TEMPLATE.format(title=title, desc=desc, nav=nav_html(), body=body, prev=prev, next=nxt))
    cards = "\n".join(f'<a class="card" href="{s}.html"><strong>{by[s][0]}</strong>{by[s][1]}</a>' for s in ORDER)
    (ROOT / "lessons.html").write_text(TEMPLATE.format(
        title="Lessons", desc="All lessons", nav=nav_html(),
        body=f'<p>Work through these in order, or jump to the one you need.</p><div class="grid">{cards}</div>', prev="", next="").replace('<p class="muted"><a href="lessons.html">All lessons</a></p>\n', ""))
    print("wrote", len(ORDER) + 1, "pages")

main()

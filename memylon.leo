<?xml version="1.0" encoding="utf-8"?>
<!-- Created by Leo (http://webpages.charter.net/edreamleo/front.html) -->
<?xml-stylesheet ekr_test?>
<leo_file xmlns:leo="http://www.leo-editor.org/2011/leo" >
<leo_header file_format="2" tnodes="0" max_tnode_index="0" clone_windows="0"/>
<globals body_outline_ratio="0.5" body_secondary_ratio="0.5">
	<global_window_position top="50" left="50" height="500" width="700"/>
	<global_log_window_position top="0" left="0" height="0" width="0"/>
</globals>
<preferences/>
<find_panel_settings/>
<vnodes>
<v t="silver.20110425004600.9530" a="E"><vh>Utils</vh>
<v t="silver.20110425004600.1330"><vh>@button publish</vh></v>
</v>
<v t="123.20110505211354.1402"
expanded="silver.20110424132433.1267,silver.20110424132433.1280,silver.20110424132433.1270,"><vh>@shadow memylon.js</vh></v>
<v t="123.20110505211354.1438" a="E"><vh>@shadow memylon.html</vh></v>
<v t="silver.20110425143056.1320"><vh>Doc</vh></v>
</vnodes>
<tnodes>
<t tx="silver.20110425004600.1330">import pygments

result = []

def scanTree(res, pRoot):
    for p2 in pRoot.children():
        if not '@ignore' in p2.b:
            res.append(p2.b)
            scanTree(res, p2)
scanTree(result, p)            
s = '\n'.join(result)

g.app.gui.runScrolledMessageDialog(c=c, msg = g.u('rst:') + s)</t>
<t tx="silver.20110425004600.9530"></t>
<t tx="silver.20110425143056.1320">@language rest

For example, to draw a single card from that atlas image, he wrote a function:

&lt;&lt; drawCard &gt;&gt;

The function takes the index of the card sprite in the atlas (that index can be negative, which means that this card should have the backside drawn. The backside sprite is the very first one in the atlas).




Here is how the text is drawn. A bunch of text parameters are set to the context, and then &lt;a href=""&gt;fillText&lt;/a&gt; is called:

&lt;&lt; draw text &gt;&gt;


By the way, the global alpha value did not affect the text transparency when tested in Chrome 10 on Linux... it worked fine in Opera, Firefox and Konqueror on Linux, and in IE9, Safari, Opera, Firefox and Chrome itself on Windows.

That's much for the "new" web standards.</t>
</tnodes>
</leo_file>

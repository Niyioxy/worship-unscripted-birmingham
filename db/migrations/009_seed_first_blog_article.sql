-- Import the existing published launch article for self-service editing.
-- Safe to rerun; never overwrites changes made by an editor.
INSERT INTO public.wu_blog_posts(slug,title,excerpt,body,status,published_at)
VALUES(
 'why-worship-unscripted-birmingham-exists',
 'Why Worship Unscripted Birmingham Exists',
 'A vision for sincere, Christ-centred worship, prayer and fellowship across churches and cultures.',
 'Worship is more than a programme on a calendar. It is a response to who God is, and it can shape how we pray, listen, live and treat one another.

Worship Unscripted Birmingham began with a simple vision: to make room for people from different churches, cultures and backgrounds to come together around Jesus Christ in authentic worship.

The word unscripted does not mean unprepared or disorderly. It points towards sincerity. We believe worship should be more than a performance, and that thoughtful preparation can make room for genuine prayer, participation and attentiveness to the Holy Spirit.

## One centre, many backgrounds

People worship in different languages, styles and traditions. These differences do not have to prevent us from learning from one another. Our desire is to create a welcoming space where worshippers can share a common focus on Christ while respecting the churches and communities they already belong to.

This is not a new church launch, nor an invitation to leave an existing church. It is a developing, independent, interdenominational worship initiative.

## More than a stage

Good music matters, but music alone is not the whole purpose. We want an atmosphere where Scripture, prayer, fellowship and singing work together. We want people to feel able to participate without pressure or pretence.

The first gathering is still being planned. We are exploring an intimate studio format in Birmingham, with a small group of worshippers and team members. A confirmed date, venue and registration arrangements will be announced only when they are ready.

## An invitation to help shape the beginning

Meaningful communities grow through people who listen, serve and show up with generosity. If you share this vision, you can read more about our vision, explore the experience, or learn how to get involved. You can also use our contact page to enquire about collaboration.

We are not promising a perfect production. We are preparing something prayerfully and intentionally: a space where worship points beyond the stage and back to Christ.',
 'published',
 now()
)
ON CONFLICT(slug) DO NOTHING;

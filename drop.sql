
use project; 
go


create table USERS(
    id int identity(1,1) primary key ,
    uname varchar(255) not null, 
    uemail varchar(255) not null unique,
    upassword varchar(255) not null,
    uage int not null check(uage>=13), 
    ucountry varchar(255) not NULL,
    u_created DATETIME DEFAULT GETDATE(),
	u_type char default('u'),
   constraint uchk1 check (
    LEN(upassword) >= 8  
    AND upassword LIKE '%[0-9]%'  
    and upassword like '%[A-Z]%'
    and upassword like '%[a-z]%'
    AND upassword LIKE '%[@$!%*?&]%'
)

);

create table artist(
    id int identity(1,1) primary key,
    aname varchar(255),
    instagram varchar(255),
   gender VARCHAR(20) CHECK (gender IN ('Male', 'Female', 'Non-binary', 'Other')),
    monthlystreams bigint

)

create table album(
    aname varchar(255),
    id int identity(1,1) primary key,
    artist int,
    constraint alfk1 FOREIGN key (artist)
    REFERENCES artist(id)

)

create table genre(
    id int identity(1,1) primary key,
    gname varchar(255)
)


create table SONGS(
    id int identity(1,1) primary key,
    stitle varchar(255) not null,
    sgenre int ,
    salbumid int, 
    srating float check(srating BETWEEN 1 AND 100), 
    simage varchar(MAX),
    srating float check(srating BETWEEN 1 AND 5), 
    simage varchar(255),
    trackuri varchar(255),
    constraint sfk2 FOREIGN key (sgenre)
    REFERENCES genre(id),
    constraint sfk3 FOREIGN key (salbumid)
    REFERENCES album(id)

);

create table songsANDartist(
    songsid int ,
    artistid int,
    primary key(songsid, artistid),
    constraint safk1 FOREIGN key (artistid)
    REFERENCES artist(id),
    constraint safk2 FOREIGN key (songsid)
    REFERENCES songs(id)

)
create table TASTE(
    taste int default 1,
    userid int not null,
    songsid int not null,
    constraint tpk1 PRIMARY KEY(userid,songsid),
    constraint tfk1 FOREIGN KEY (userid)
    REFERENCES USERS(id) ON DELETE CASCADE ON UPDATE CASCADE,
    constraint tfk2 FOREIGN KEY (songsid)
    REFERENCES SONGS(id) ON DELETE CASCADE ON UPDATE CASCADE
);


create table PLAYLIST(
    id int identity(1,1) primary key, 
    ptitle varchar(255) not null,
    pdescription text,
    userid int not null,
    p_created DATETIME DEFAULT GETDATE(),
    p_updated DATETIME DEFAULT GETDATE(),
    constraint pfk1 FOREIGN KEY (userid)
    REFERENCES USERS (id) ON DELETE CASCADE ON UPDATE CASCADE,
    
);

create table PLAYLIST_S(
    playlistid int not NULL,
    songsid int not null,
    ps_added DATETIME DEFAULT GETDATE(),
    constraint pspk1 PRIMARY KEY(playlistid,songsid),
    constraint psfk1 FOREIGN KEY (playlistid) 
    REFERENCES PLAYLIST(id) ON DELETE CASCADE ON UPDATE CASCADE,
    constraint psfk2 FOREIGN KEY (songsid) 
    REFERENCES SONGS(id) on delete cascade on update cascade

);

create table friends(
    user1 int ,
    user2 int ,
    primary key(user1,user2),
    constraint ffk1 FOREIGN KEY (user1)
    REFERENCES USERS (id) ,
    constraint ffk2 FOREIGN KEY (user2)
    REFERENCES USERS (id) ,
)
select * from PLAYLIST
select * from PLAYLIST_S
select * from TASTE
select * from SONGS
select * from USERS
select * from album
select * from artist
select * from genre 
select * from friends
select * from songsANDartist
go
use project; 
go

go
CREATE VIEW PlaylistSongsView AS
SELECT ps.playlistid, s.id AS songid, s.stitle,  s.sgenre, s.salbumid, s.srating
FROM PLAYLIST_S ps
INNER JOIN SONGS s ON ps.songsid = s.id;
go

CREATE OR ALTER VIEW UserLikedSongsView AS
SELECT 
    t.userid,
    s.id AS songid,
    s.stitle AS songtitle,
    g.gname AS genre,
    STRING_AGG(a.aname, ', ') AS artist_name,
    al.aname AS album_name,
    s.srating AS rating,
    s.simage AS image_url,
    s.trackuri AS track_uri
FROM TASTE t
JOIN SONGS s ON t.songsid = s.id
LEFT JOIN genre g ON s.sgenre = g.id
LEFT JOIN album al ON s.salbumid = al.id
LEFT JOIN songsANDartist sa ON s.id = sa.songsid
LEFT JOIN artist a ON sa.artistid = a.id
WHERE a.aname IS NOT NULL 
GROUP BY 
    t.userid,
    s.id,
    s.stitle,
    g.gname,
    al.aname,
    s.srating,
    s.simage,
    s.trackuri;

go

select * from UserLikedSongsView

           
    
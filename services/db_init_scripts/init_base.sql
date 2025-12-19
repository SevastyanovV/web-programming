create table if not exists orders(
    id         serial                  primary key  ,
    user_id    integer        not null              ,
    items      jsonb          not null              ,
    status     varchar(50)    not null              ,
    created_at timestamp               default now(),
    payment    decimal(10, 2)
);

create table if not exists outbox(
    id         serial                primary key                       ,
    event_type varchar(255) not null                                   ,
    payload    jsonb        not null                                   ,
    created_at timestamp             default (now() at time zone 'utc'),
    processed  boolean               default false
);

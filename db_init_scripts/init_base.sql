create table if not exists event_types(
    id     serial          primary key,
    "type" text   not null unique
);

create table if not exists events(
    id         serial                  primary key               ,
    type_id    integer        not null references event_types(id),
    "name"     text           not null                           ,
    datetime   timestamp      not null unique                    ,
    author     text           not null                           ,
    tags       text[]                                            ,
    img_name   text           not null                           ,
    price      decimal(10, 2) not null                           ,
    rating     real           not null                           ,
    discount   real           not null
);

create table if not exists users(
    id         serial               primary key  ,
    username   varchar(32) not null unique       ,
    created_at timestamp   not null default now()
);

create table if not exists orders(
    id          serial                  primary key          ,
    user_id     integer        not null references users(id) ,
    event_id    integer        not null references events(id),
    created_at  timestamp      not null default now()        ,
    payment     decimal(10, 2) not null                      ,
    ticket_code varchar(32)    not null unique
);

create table if not exists occupied_seats(
    id       serial               primary key          ,
    event_id integer     not null references events(id),
    seat_id  varchar(15) not null                      ,
    order_id integer     not null references orders(id),
    unique(event_id, seat_id)
);


insert into event_types ("type") values ('Шоу'), ('Концерт'), ('События в ближайшие дни');

insert into events (type_id, "name", datetime, author, tags, img_name, price, rating, discount) values
    (3, 'Зимние грёзы', '2026-01-5 18:00:00', 'Артисты театра Современник', array['Театр', 'Драма', 'Зима', 'Премьера', '16+'], 'winter_dreams.jpg', 1800.00, 8.5, 30.0),
    (3, 'Провожая старый год', '2026-01-3 19:00:00', 'Звёзды эстрады', array['Концерт', 'Рок', 'Альтернатива', 'Новогоднее', '16+'], '2025_year_farewell.jpg', 2000.00, 8.8, 35.0),
    (3, 'Щелкунчик', '2026-01-07 17:30:00', 'Артисты Большого театра', array['Классика', 'Чайковский', 'Семейное', '6+'], 'nutcracker.jpg', 4000.00, 9.6, 20.0),
    (1, 'Песни советских кинофильмов', '2026-01-10 19:00:00', 'Оркестр CAGMO', array['Оркестр', 'Киномузыка', 'Ностальгия'], 'cagmo_soviet_films.jpg', 2500.00, 9.2, 15.0),
    (1, 'Рок-симфония при свечах', '2026-01-11 20:30:00', 'Оркестр CAGMO', array['Оркестр', 'Рок', 'Свечи', 'Романтика', '16+'], 'cagmo.jpg', 2800.00, 9.5, 20.0),
    (1, 'Симфония Imagine Dragons и Coldplay', '2026-01-12 21:00:00', 'Оркестр CAGMO', array['Шоу', 'Оркестр', 'Современная музыка', 'Поп-рок'], 'cagmo.jpg', 3000.00, 9.7, 10.0),
    (2, 'Rock Legends: The Best of 90s', '2026-01-14 20:00:00', 'Various Artists', array['Рок', '90s', 'Лайв', 'Легенды', '18+'], 'rock_90_legends.jpg', 3500.00, 9.3, 25.0),
    (2, 'Джаз под звездами', '2026-01-20 19:30:00', 'Московский джаз-бэнд', array['Джаз', 'Живая музыка', 'Открытая площадка', '16+'], 'jazz.jpg', 2200.00, 8.9, 15.0),
    (2, 'Symphonic Metal Night', '2026-01-24 21:00:00', 'Epica Symphony', array['Метал', 'Симфоник-метал', 'Энергия', '18+'], 'symphonic_metal.jpg', 3200.00, 9.4, 10.0);

insert into users (username) values ('test_user');

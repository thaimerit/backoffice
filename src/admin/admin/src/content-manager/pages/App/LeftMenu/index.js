/**
 *
 * LeftMenu
 *
 */

import React, { useMemo, useState } from "react";
import { useSelector, shallowEqual } from "react-redux";
import { useIntl } from "react-intl";
import matchSorter from "match-sorter";
import sortBy from "lodash/sortBy";
import toLower from "lodash/toLower";
import { NavLink } from "react-router-dom";
import {
  SubNav,
  SubNavHeader,
  SubNavSection,
  SubNavSections,
  SubNavLink,
} from "@strapi/design-system/v2/SubNav";
import getTrad from "../../../utils/getTrad";
import { makeSelectModelLinks } from "../selectors";

const menus = [
  {
    id: "e-merit",
    name: "ทำบุญออนไลน์",
    children: [
      {
        name: "สถานที่",
        uid: "api::place.place",
      },
      {
        name: "แพ็คเกจ",
        uid: "api::package.package",
      },
      {
        name: "พาร์ทเนอร์",
        uid: "api::user-partner.user-partner",
      },
      {
        name: "Partner Timeslot",
        uid: "api::partner-timeslot.partner-timeslot",
      },
    ],
  },
  {
    id: "e-product",
    name: "สินค้ามงคล",
    children: [
      {
        name: "สินค้า",
        uid: "api::product.product",
      },
    ],
  },
  {
    id: "e-holystick",
    name: "เซียมซีออนไลน์",
    children: [
      {
        name: "เซียมซีออนไลน์",
        uid: "api::holystick.holystick",
      },
    ],
  },
  {
    id: "e-live",
    name: "ไหว้พระออนไลน์",
    children: [
      {
        name: "ไหว้พระออนไลน์",
        uid: "api::live.live",
      },
    ],
  },
  {
    id: "admin.order",
    name: "รายการสั่งซื้อ",
    children: [
      {
        name: "คำสั่งซื้อ",
        uid: "api::order.order",
      },
      {
        name: "คำสั่งซื้อสินค้ามงคล",
        uid: "api::product-order.product-order",
      },
      {
        name: "ประวัติการชำระเงิน",
        uid: "api::payment.payment",
      },
    ],
  },
  {
    id: "admin.donation",
    name: "การบริจาค",
    children: [
      {
        name: "จุดประสงค์การบริจาค",
        uid: "api::donation-reason.donation-reason",
      },
    ],
  },
  {
    id: "admin.horoscope",
    name: "ทำนายดวง",
    children: [
      {
        name: "สีประจำวัน",
        uid: "api::color-of-week.color-of-week",
      },
      {
        name: "คำทำนาย",
        uid: "api::horoscope.horoscope",
      },
      {
        name: "เสริมบุญเฉพาะคุณ",
        uid: "api::birthday-recommendation.birthday-recommendation",
      },
    ],
  },
  {
    id: "admin.setting",
    name: "การตั้งค่าทั่วไป",
    children: [
      {
        name: "ประเภทสถานที่",
        uid: "api::place-type.place-type",
      },
      {
        name: "ประเภทสิ่งศักดิ์สิทธิ์",
        uid: "api::sacred-type.sacred-type",
      },
      {
        name: "ประเภทสินค้า/แพ็คเกจ",
        uid: "api::category.category",
      },
      {
        name: "ราศี",
        uid: "api::zodiac.zodiac",
      },
      {
        name: "ปีนักษัตรจีน",
        uid: "api::chinese-zodiac.chinese-zodiac",
      },
      {
        name: "วัน",
        uid: "api::day-of-week.day-of-week",
      },
      {
        name: "สี",
        uid: "api::color.color",
      },
      {
        name: "ภูมิภาค",
        uid: "api::region.region",
      },
      {
        name: "จังหวัด",
        uid: "api::province.province",
      },
      {
        name: "Tag",
        uid: "api::tag.tag",
      },
      {
        name: "ธนาคาร",
        uid: "api::bank.bank",
      },
      {
        name: "เพิ่มหน้าเว็บไซต์",
        uid: "api::page.page",
      },
    ],
  },
  {
    id: "admin.user",
    name: "ผู้ใช้งาน",
    children: [
      {
        name: "จัดการผู้ใช้งาน (User)",
        uid: "plugin::users-permissions.user",
      },
    ],
  },
  {
    id: "admin.notification",
    name: "การแจ้งเตือน",
    children: [
      {
        name: "ส่งการแจ้งเตือน",
        uid: "api::send-notification.send-notification",
      },
      {
        name: "ข้อความ",
        uid: "api::notification.notification",
      },
    ],
  },
  {
    id: "admin.setting",
    name: "ตั้งค่า",
    children: [
      {
        name: "ตั้งค่าระบบ",
        uid: "api::config.config",
      },
      {
        name: "ตั้งค่าสำหรับ เว็บ/แอป",
        uid: "api::app-config.app-config",
      },
      {
        name: "ตั้งค่าข้อความ",
        uid: "api::message-template.message-template",
      },
      {
        name: "FCM Configuration",
        uid: "plugin::fcm.fcm-plugin-configuration",
      },
      {
        name: "Line Configuration",
        uid: "plugin::line-notify.line-notify-config",
      },
    ],
  },
];

function formatMenu(defaultMenus) {
  let newMenus = [];
  let items = [];

  defaultMenus.forEach((o) => {
    items = [...items, ...o.links];
  });

  console.log(items);

  menus.forEach((menu) => {
    let obj = {
      id: menu.id,
      title: menu.name,
      searchable: true,
      links: [],
    };

    if (menu.uid) {
      obj.uid = menu.uid;

      let found = items.find((o) => o.uid == menu.uid);
      console.log({ found });
      if (found) {
        obj = { ...obj, ...found };
      }
    } else {
      menu.children.forEach((subMenu) => {
        let found = items.find((o) => o.uid == subMenu.uid);
        if (found) {
          obj.links.push(found);
        }
      });
    }

    newMenus.push(obj);
  });

  return newMenus;
}

const matchByTitle = (links, search) =>
  matchSorter(links, toLower(search), {
    keys: [(item) => toLower(item.title)],
  });

const LeftMenu = () => {
  const [search, setSearch] = useState("");
  const { formatMessage } = useIntl();
  const modelLinksSelector = useMemo(makeSelectModelLinks, []);
  const { collectionTypeLinks, singleTypeLinks } = useSelector(
    (state) => modelLinksSelector(state),
    shallowEqual
  );

  const toIntl = (links) =>
    links.map((link) => {
      return {
        ...link,
        title: formatMessage({ id: link.title, defaultMessage: link.title }),
      };
    });

  const intlCollectionTypeLinks = toIntl(collectionTypeLinks);
  const intlSingleTypeLinks = toIntl(singleTypeLinks);

  const menu = [
    {
      id: "collectionTypes",
      title: {
        id: getTrad("components.LeftMenu.collection-types"),
        defaultMessage: "Collection Types",
      },
      searchable: true,
      links: sortBy(matchByTitle(intlCollectionTypeLinks, search), (object) =>
        object.title.toLowerCase()
      ),
    },
    {
      id: "singleTypes",
      title: {
        id: getTrad("components.LeftMenu.single-types"),
        defaultMessage: "Single Types",
      },
      searchable: true,
      links: sortBy(matchByTitle(intlSingleTypeLinks, search), (object) =>
        object.title.toLowerCase()
      ),
    },
  ];

  const handleClear = () => {
    setSearch("");
  };

  const handleChangeSearch = ({ target: { value } }) => {
    setSearch(value);
  };

  const label = formatMessage({
    id: getTrad("header.name"),
    defaultMessage: "Content",
  });

  // const new_menus = [
  //   {
  //     "id": "collectionTypes",
  //     "title": "ทำบุญออนไลน์",
  //     "searchable": true,
  //     "links": [
  //       {
  //         "permissions": [
  //             {
  //                 "action": "plugin::content-manager.explorer.create",
  //                 "subject": "plugin::fcm.fcm-token"
  //             },
  //             {
  //                 "action": "plugin::content-manager.explorer.read",
  //                 "subject": "plugin::fcm.fcm-token"
  //             }
  //         ],
  //         "search": "page=1&pageSize=10&sort=fcmToken:ASC",
  //         "kind": "collectionType",
  //         "title": "FCM Token",
  //         "to": "/content-manager/collectionType/plugin::fcm.fcm-token",
  //         "uid": "plugin::fcm.fcm-token",
  //         "name": "plugin::fcm.fcm-token",
  //         "isDisplayed": true
  //     },
  //     ]
  //   },
  //   {
  //     "id": "collectionTypes",
  //     "title": "ทำบุญออนไลน์",
  //     "searchable": true,
  //     "links": [
  //       {
  //         "permissions": [
  //             {
  //                 "action": "plugin::content-manager.explorer.create",
  //                 "subject": "plugin::fcm.fcm-token"
  //             },
  //             {
  //                 "action": "plugin::content-manager.explorer.read",
  //                 "subject": "plugin::fcm.fcm-token"
  //             }
  //         ],
  //         "search": "page=1&pageSize=10&sort=fcmToken:ASC",
  //         "kind": "collectionType",
  //         "title": "FCM Token",
  //         "to": "/content-manager/collectionType/plugin::fcm.fcm-token",
  //         "uid": "plugin::fcm.fcm-token",
  //         "name": "plugin::fcm.fcm-token",
  //         "isDisplayed": true
  //     },
  //     ]
  //   },
  //   {
  //     "id": "collectionTypes",
  //     "title": "ทำบุญออนไลน์",
  //     "searchable": true,
  //     "links": [
  //       {
  //         "permissions": [
  //             {
  //                 "action": "plugin::content-manager.explorer.create",
  //                 "subject": "plugin::fcm.fcm-token"
  //             },
  //             {
  //                 "action": "plugin::content-manager.explorer.read",
  //                 "subject": "plugin::fcm.fcm-token"
  //             }
  //         ],
  //         "search": "page=1&pageSize=10&sort=fcmToken:ASC",
  //         "kind": "collectionType",
  //         "title": "FCM Token",
  //         "to": "/content-manager/collectionType/plugin::fcm.fcm-token",
  //         "uid": "plugin::fcm.fcm-token",
  //         "name": "plugin::fcm.fcm-token",
  //         "isDisplayed": true
  //     },
  //     ]
  //   }
  // ]

  const new_menus = formatMenu(menu);

  return (
    <SubNav ariaLabel={label}>
      <SubNavHeader
        label={label}
        searchable
        value={search}
        onChange={handleChangeSearch}
        onClear={handleClear}
        searchLabel={formatMessage({
          id: "content-manager.components.LeftMenu.Search.label",
          defaultMessage: "Search for a content type",
        })}
      />
      {/* <pre>{JSON.stringify(menu, null, 2)}</pre> */}
      <SubNavSections>
        {new_menus.map((section) => {
          const label = section.title;

          if (section.uid) {
            const search = section.search ? `?${section.search}` : "";
            return (
              <SubNavLink as={NavLink} to={`${section.to}${search}`}>
                {section.title}
              </SubNavLink>
            );
          }

          return (
            <SubNavSection
              key={section.id}
              label={label}
              // badgeLabel={section.links.length.toString()}
            >
              {section.links.map((link) => {
                const search = link.search ? `?${link.search}` : "";

                return (
                  <SubNavLink
                    as={NavLink}
                    key={link.uid}
                    to={`${link.to}${search}`}
                  >
                    {link.title}
                  </SubNavLink>
                );
              })}
            </SubNavSection>
          );
        })}
      </SubNavSections>
    </SubNav>
  );
};

export default LeftMenu;

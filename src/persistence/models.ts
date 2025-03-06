import { Sequelize, DataTypes, Model, ModelAttributes } from 'sequelize';
import {
  Assignation,
  Banned as _Banned,
  Client,
  Named,
  Lock,
  Ringtone,
  Setting,
  Chat,
  Message,
  Attachment,
  Subscription,
} from './Entities';
import {
  ASSIGNATIONS,
  CHAT_CONTACTS,
  CHAT_MESSAGES,
  CHAT_OWNER,
  CHAT_RINGTONE,
  CHAT_SUBSCRIPTIONS,
  CLIENT_SUBSCRIPTIONS,
  CONTACT_CHATS,
  MESSAGE_ATTACHMENTS,
  MESSAGE_SENDER,
  MESSAGES_IDXS,
  MESSAGES_MESSAGES,
  OWNED_CHATS,
  PERMISSIONS,
  RESTRICTED_CONTACTS,
  RESTRICTOR_CONTACTS,
  SUBSCRIPTION_CLIENT,
  TablesNames,
} from './constants';
import { E } from './interfaces';

export function defineModels(sequelize: Sequelize) {
  const Permissions = sequelize.define<E<Named, 'id'>>(
    TablesNames.Permissions,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
  );

  const Clients = sequelize.define<
    E<
      Client,
      'id' | 'about_me' | 'img' | 'phone_number' | 'first_name' | 'last_name'
    >
  >(
    TablesNames.Clients,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      username: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      phone_number: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      first_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      last_name: {
        type: DataTypes.STRING,
        allowNull: true,
      },
      about_me: {
        type: DataTypes.STRING(400),
        allowNull: true,
      },
      img: {
        type: DataTypes.STRING(),
        allowNull: true,
      },
    },
    {
      indexes: [
        { unique: true, fields: ['email'] },
        { unique: true, fields: ['username'] },
      ],
    },
  );

  const Assignations = sequelize.define<E<Assignation, 'id'>>(
    TablesNames.Assignations,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      client: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Clients,
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      permission: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Permissions,
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
    { indexes: [{ unique: true, fields: ['permission', 'client'] }] },
  );

  Clients.hasMany(Assignations, {
    foreignKey: 'client',
    as: ASSIGNATIONS,
  });
  Assignations.belongsTo(Clients, { foreignKey: 'client' });

  Clients.belongsToMany(Permissions, {
    through: Assignations,
    foreignKey: 'client',
    as: PERMISSIONS,
  });
  Permissions.belongsToMany(Clients, {
    through: Assignations,
    foreignKey: 'permission',
  });

  const Banned = sequelize.define<E<_Banned, 'id'>>(TablesNames.Banned, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    motive: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    client: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
      references: {
        model: Clients,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
  });

  Banned.belongsTo(Clients, { foreignKey: 'client' });
  Clients.hasOne(Banned, { foreignKey: 'client' });

  const Restrictions = sequelize.define<E<Named, 'id'>>(
    TablesNames.Restrictions,
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: { type: DataTypes.STRING, allowNull: false },
    },
  );

  const Locks = sequelize.define<E<Lock, never>>(TablesNames.Locks, {
    restrictor: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clients,
        key: 'id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    restricted: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clients,
        key: 'id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    restriction: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Restrictions,
        key: 'id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
  });

  Clients.hasMany(Locks, {
    foreignKey: 'restrictor',
    as: RESTRICTOR_CONTACTS,
  });

  Clients.hasMany(Locks, {
    foreignKey: 'restricted',
    as: RESTRICTED_CONTACTS,
  });

  Locks.belongsTo(Clients, { foreignKey: 'restricted' });

  const Ringtones = sequelize.define<E<Ringtone, 'id'>>(TablesNames.Ringtones, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    url: { type: DataTypes.STRING, allowNull: false },
  });

  const Settings = sequelize.define<
    E<Setting, 'notification_tone' | 'groups_tone'>
  >(TablesNames.Settings, {
    enable_notifications: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    seen_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    show_online_status: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    discoverability: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    chat_approval: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
    },
    client: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clients,
        key: 'id',
      },
      onDelete: 'CASCADE',
      primaryKey: true,
    },
    notification_tone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Ringtones,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
    groups_tone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Ringtones,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  });

  Clients.hasOne(Settings, { foreignKey: 'client' });
  Settings.belongsTo(Clients, { foreignKey: 'client' });

  Ringtones.hasMany(Settings, { foreignKey: 'groups_tone' });
  Settings.belongsTo(Ringtones, {
    foreignKey: 'groups_tone',
  });

  Ringtones.hasMany(Settings, {
    foreignKey: 'notification_tone',
  });
  Settings.belongsTo(Ringtones, {
    foreignKey: 'notification_tone',
  });

  const Chats = sequelize.define<
    E<Chat, 'id' | 'custom_ringtone' | 'img' | 'name'>
  >(TablesNames.Chats, {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: { type: DataTypes.STRING, allowNull: false },
    img: { type: DataTypes.STRING, allowNull: true },
    owner: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Clients,
        key: 'id',
      },
      onDelete: 'NO ACTION', //The next subsciber becomes the owner
    },
    custom_ringtone: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: Ringtones,
        key: 'id',
      },
      onDelete: 'SET NULL',
    },
  });

  Clients.hasMany(Chats, { foreignKey: 'owner', as: OWNED_CHATS });
  Chats.belongsTo(Clients, { foreignKey: 'owner', as: CHAT_OWNER });

  Chats.belongsTo(Ringtones, {
    foreignKey: 'custom_ringtone',
    as: CHAT_RINGTONE,
  });

  const Subscriptions = sequelize.define<E<Subscription, never>>(
    TablesNames.Subscriptions,
    {
      sub: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Clients,
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
      chat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Chats,
          key: 'id',
        },
        onDelete: 'CASCADE',
        primaryKey: true,
      },
    },
  );

  Clients.hasMany(Subscriptions, {
    foreignKey: 'sub',
    as: CLIENT_SUBSCRIPTIONS,
  });
  Subscriptions.belongsTo(Clients, {
    foreignKey: 'sub',
    as: SUBSCRIPTION_CLIENT,
  });

  Chats.hasMany(Subscriptions, {
    foreignKey: 'chat',
    as: CHAT_SUBSCRIPTIONS,
  });

  Chats.belongsToMany(Clients, {
    through: { model: Subscriptions, unique: false },
    foreignKey: 'chat',
    as: CHAT_CONTACTS,
  });

  Clients.belongsToMany(Chats, {
    through: { model: Subscriptions, unique: false },
    foreignKey: 'sub',
    as: CONTACT_CHATS,
  });

  const Messages = sequelize.define<E<Message, 'id'>>(
    TablesNames.Messages,
    {
      id: {
        type: DataTypes.BIGINT,
        autoIncrement: true,
        primaryKey: true,
      },
      content: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      sender: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Clients,
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      chat: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: Chats,
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
      receptionTime: {
        type: DataTypes.TIME,
        allowNull: false,
      },
    },
    {
      indexes: [
        {
          fields: [{ name: 'receptionTime', order: 'DESC' }],
          unique: false,
        },
      ],
    },
  );

  Clients.hasMany(Messages, { foreignKey: 'sender' });
  Messages.belongsTo(Clients, { foreignKey: 'sender', as: MESSAGE_SENDER });

  Chats.hasMany(Messages, { foreignKey: 'chat', as: CHAT_MESSAGES });
  Messages.belongsTo(Chats, { foreignKey: 'chat' });

  Messages.hasMany(Messages, {
    sourceKey: 'chat',
    foreignKey: 'chat',
    as: MESSAGES_IDXS,
  });

  Messages.hasMany(Messages, {
    foreignKey: 'id',
    as: MESSAGES_MESSAGES,
  });

  const Attachments = sequelize.define<E<Attachment, 'id'>>(
    TablesNames.Attachments,
    {
      id: { type: DataTypes.INTEGER, autoIncrement: true, primaryKey: true },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      url: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      message: {
        type: DataTypes.BIGINT,
        allowNull: false,
        references: {
          model: Messages,
          key: 'id',
        },
        onDelete: 'CASCADE',
      },
    },
  );

  Messages.hasMany(Attachments, {
    foreignKey: 'message',
    as: MESSAGE_ATTACHMENTS,
  });
  Attachments.belongsTo(Messages, { foreignKey: 'message' });

  return {
    [TablesNames.Permissions]: Permissions,
    [TablesNames.Assignations]: Assignations,
    [TablesNames.Clients]: Clients,
    [TablesNames.Banned]: Banned,
    [TablesNames.Restrictions]: Restrictions,
    [TablesNames.Locks]: Locks,
    [TablesNames.Ringtones]: Ringtones,
    [TablesNames.Settings]: Settings,
    [TablesNames.Chats]: Chats,
    [TablesNames.Subscriptions]: Subscriptions,
    [TablesNames.Messages]: Messages,
    [TablesNames.Attachments]: Attachments,
  };
}
